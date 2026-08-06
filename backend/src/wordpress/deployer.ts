import { v4 as uuidv4 } from 'uuid';
import { WordPressClient } from './client';
import { logger } from '../lib/logger';
import { getDb } from '../db/client';
import { THEMES } from '../lib/themes';
import { generateSchema } from '../engines/schema-engine';
import type {
  GeneratedPage,
  BusinessProfile,
  Deployment,
  DeployLogEntry,
  WPPageData,
  PageImage,
  ThemeName,
} from '../types';

export interface DeployOptions {
  page_ids?: string[];
  force?: boolean;
}

/**
 * Deploy generated pages to WordPress.
 * Returns the deployment record with status.
 */
export async function deployPages(
  projectId: string,
  wpUrl: string,
  pluginKey: string,
  profile: BusinessProfile,
  opts: DeployOptions = {}
): Promise<Deployment> {
  const db = getDb();
  const client = new WordPressClient(wpUrl, pluginKey);
  const deployId = uuidv4();
  const now = new Date().toISOString();

  // ── Fetch pages to deploy ──────────────────────────────────────────────────
  let pages: GeneratedPage[];

  if (opts.page_ids && opts.page_ids.length > 0) {
    const placeholders = opts.page_ids.map(() => '?').join(',');
    const rows = db
      .prepare(
        `SELECT * FROM generated_pages WHERE project_id = ? AND id IN (${placeholders})`
      )
      .all(projectId, ...opts.page_ids) as Record<string, unknown>[];
    pages = rows.map(deserializePage);
  } else {
    // Include both 'done' (never deployed) and 'deployed' (update existing WP pages).
    // This way every deploy run is idempotent — the WP plugin upserts by slug.
    const rows = db
      .prepare(`SELECT * FROM generated_pages WHERE project_id = ? AND status IN ('done', 'deployed')`)
      .all(projectId) as Record<string, unknown>[];
    pages = rows.map(deserializePage);
  }

  // ── Create deployment record ───────────────────────────────────────────────
  const deployment: Deployment = {
    id: deployId,
    project_id: projectId,
    status: 'running',
    pages_total: pages.length,
    pages_created: 0,
    pages_failed: 0,
    log: [],
    started_at: now,
    created_at: now,
  };

  db.prepare(
    `INSERT INTO deployments (id, project_id, status, pages_total, pages_created, pages_failed, log, started_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    deployment.id,
    deployment.project_id,
    deployment.status,
    deployment.pages_total,
    deployment.pages_created,
    deployment.pages_failed,
    JSON.stringify(deployment.log),
    deployment.started_at ?? null,
    deployment.created_at
  );

  logger.info(`Deployment ${deployId} started for project ${projectId}: ${pages.length} pages`);

  // ── Push theme CSS to WordPress ────────────────────────────────────────────
  try {
    const projectRow = db.prepare('SELECT theme FROM projects WHERE id = ?').get(projectId) as { theme?: string } | undefined;
    const theme = ((projectRow?.theme ?? 'horizon') as ThemeName);
    await client.pushSettings({ theme_name: theme, theme_css: THEMES[theme]?.css ?? THEMES.horizon.css });
    logger.info(`Theme CSS (${theme}) pushed to WordPress before deployment`);
  } catch (cssErr) {
    logger.warn('Could not push theme CSS before deployment (non-fatal)', { cssErr });
  }

  // ── Push project/profile data (used by ISM footer builder) ───────────────
  try {
    await client.pushProject({
      business_name: profile.business_name ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      tagline: profile.description ?? '',
    });
    logger.info('Project data pushed to WordPress');
  } catch (projErr) {
    logger.warn('Could not push project data to WordPress (non-fatal)', { projErr });
  }

  // ── Upload logo if stored as a data URI ───────────────────────────────────
  if (profile.logo_url?.startsWith('data:')) {
    try {
      const commaIdx = profile.logo_url.indexOf(',');
      const header = profile.logo_url.slice(0, commaIdx);
      const data_b64 = profile.logo_url.slice(commaIdx + 1);
      const mime_type = header.match(/:(.*?);/)?.[1] ?? 'image/png';
      const ext = mime_type.split('/')[1] ?? 'png';
      const { media_id, url: wpLogoUrl } = await client.uploadMedia(`ism-logo.${ext}`, data_b64, mime_type);
      await client.pushSettings({ logo_attachment_id: media_id });
      db.prepare(`UPDATE business_profiles SET logo_url = ? WHERE project_id = ?`).run(wpLogoUrl, projectId);
      logger.info(`Logo uploaded: ${wpLogoUrl}`);
    } catch (logoErr) {
      logger.warn('Logo upload failed (non-fatal)', { logoErr });
    }
  }

  // ── Deploy one page at a time ─────────────────────────────────────────────
  // Sending pages individually avoids PHP memory exhaustion on shared hosting
  // and gives a clear per-page error if something goes wrong.
  for (const page of pages) {
    // Upload images and replace placeholders
    let processedPage = page;
    if (page.images_json?.length) {
      try {
        const { images, html } = await uploadPageImages(page, client);
        const hasNewUploads = images.some((img) => img.wp_url && !page.images_json?.find((o) => o.slot === img.slot)?.wp_url);
        if (hasNewUploads) {
          const updatedPage: GeneratedPage = { ...page, images_json: images, content_html: html };
          const schema = generateSchema(updatedPage, profile, page.locale);
          db.prepare(
            `UPDATE generated_pages SET images_json = ?, content_html = ?, schema_json = ?, updated_at = ? WHERE id = ?`
          ).run(JSON.stringify(images), html, JSON.stringify(schema), new Date().toISOString(), page.id);
          processedPage = updatedPage;
        } else {
          processedPage = { ...page, content_html: html };
        }
      } catch (imgErr) {
        logger.warn(`Image upload skipped for ${page.slug}: ${imgErr instanceof Error ? imgErr.message : String(imgErr)}`);
      }
    }

    // Inject internal links into HTML before sending to WordPress
    if (processedPage.internal_links?.length && processedPage.content_html) {
      processedPage = {
        ...processedPage,
        content_html: injectInternalLinks(processedPage.content_html, processedPage.internal_links, wpUrl),
      };
    }

    const wpPage = pageToWPData(processedPage, profile);

    try {
      const result = await client.bulkCreatePages([wpPage]);
      const ts = new Date().toISOString();

      if (result.created.length > 0) {
        const created = result.created[0];
        const slug = (created as any).slug ?? page.slug;
        deployment.log.push({ ts, slug, status: 'ok', wp_page_id: created.id });
        deployment.pages_created++;
        db.prepare(
          `UPDATE generated_pages SET wp_page_id = ?, status = 'deployed', updated_at = ? WHERE project_id = ? AND slug = ?`
        ).run(created.id, ts, projectId, slug);
        logger.info(`Deployed: ${slug} → WP ID ${created.id}`);
      } else if (result.failed.length > 0) {
        const failed = result.failed[0];
        deployment.log.push({ ts, slug: page.slug, status: 'failed', message: failed.error });
        deployment.pages_failed++;
        logger.warn(`Failed to deploy ${page.slug}: ${failed.error}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Deploy error for ${page.slug}: ${msg}`);
      deployment.log.push({ ts: new Date().toISOString(), slug: page.slug, status: 'failed', message: msg });
      deployment.pages_failed++;
    }

    // Persist progress after each page
    db.prepare(
      `UPDATE deployments SET pages_created = ?, pages_failed = ?, log = ? WHERE id = ?`
    ).run(deployment.pages_created, deployment.pages_failed, JSON.stringify(deployment.log), deployId);
  }

  // ── Post-deploy: nav menu + static front page ─────────────────────────────
  // Re-fetch pages with fresh wp_page_id values after all updates
  const deployedRows = db
    .prepare(`SELECT * FROM generated_pages WHERE project_id = ? AND wp_page_id IS NOT NULL`)
    .all(projectId) as Record<string, unknown>[];
  const deployedPages = deployedRows.map(deserializePage);

  try {
    await buildNavMenu(deployedPages, client, wpUrl);
    logger.info('Navigation menu built and assigned');
  } catch (menuErr) {
    logger.warn('Nav menu creation failed (non-fatal)', { menuErr });
  }

  try {
    const homePage = deployedPages.find((p) => p.page_type === 'homepage');
    if (homePage?.wp_page_id) {
      await client.pushSettings({ front_page_id: homePage.wp_page_id });
      logger.info(`Static front page set to WP ID ${homePage.wp_page_id}`);
    }
  } catch (fpErr) {
    logger.warn('Front page setting failed (non-fatal)', { fpErr });
  }

  // ── Finalize ───────────────────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  deployment.status = deployment.pages_failed === 0 ? 'done' : 'failed';
  deployment.completed_at = completedAt;

  db.prepare(
    `UPDATE deployments SET status = ?, completed_at = ?, log = ? WHERE id = ?`
  ).run(deployment.status, completedAt, JSON.stringify(deployment.log), deployId);

  // Update project page_count
  db.prepare(
    `UPDATE projects SET page_count = ?, updated_at = ? WHERE id = ?`
  ).run(deployment.pages_created, completedAt, projectId);

  logger.info(
    `Deployment ${deployId} finished: ${deployment.pages_created} created, ${deployment.pages_failed} failed`
  );

  return deployment;
}

// ─── Serialization helpers ────────────────────────────────────────────────────

function deserializePage(row: Record<string, unknown>): GeneratedPage {
  return {
    id: row['id'] as string,
    brief_id: row['brief_id'] as string,
    project_id: row['project_id'] as string,
    locale: row['locale'] as string,
    slug: row['slug'] as string,
    page_type: row['page_type'] as GeneratedPage['page_type'],
    h1: row['h1'] as string | undefined,
    meta_title: row['meta_title'] as string | undefined,
    meta_description: row['meta_description'] as string | undefined,
    content_html: row['content_html'] as string | undefined,
    schema_json: row['schema_json'] ? JSON.parse(row['schema_json'] as string) : undefined,
    images_json: row['images_json'] ? JSON.parse(row['images_json'] as string) : [],
    internal_links: row['internal_links'] ? JSON.parse(row['internal_links'] as string) : [],
    status: row['status'] as GeneratedPage['status'],
    wp_page_id: row['wp_page_id'] as number | undefined,
    created_at: row['created_at'] as string,
    updated_at: row['updated_at'] as string,
  };
}

async function uploadPageImages(
  page: GeneratedPage,
  client: WordPressClient
): Promise<{ images: PageImage[]; html: string }> {
  const images = page.images_json ?? [];
  let html = page.content_html ?? '';

  if (images.length === 0) return { images, html };

  const updated = await Promise.all(
    images.map(async (img) => {
      if (img.wp_url || !img.data_b64) return img;
      try {
        const filename = `ism-${img.slot}-${Date.now()}.png`;
        const { media_id, url } = await client.uploadMedia(filename, img.data_b64, 'image/png');
        html = html.replace(`[ISM_IMAGE:${img.slot}]`, url);
        return { ...img, wp_media_id: media_id, wp_url: url };
      } catch (err) {
        logger.warn(`Image upload failed (${img.slot}) for ${page.slug}: ${err instanceof Error ? err.message : String(err)}`);
        return img;
      }
    })
  );

  return { images: updated, html };
}

function pageToWPData(page: GeneratedPage, _profile: BusinessProfile): WPPageData {
  return {
    slug: page.slug,
    title: page.meta_title ?? page.h1 ?? page.slug,
    content: page.content_html ?? '',
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    schema_json: page.schema_json,
    status: 'publish',
  };
}

function injectInternalLinks(
  html: string,
  links: GeneratedPage['internal_links'],
  wpUrl: string
): string {
  if (!links?.length) return html;
  let result = html;
  for (const link of links) {
    if (!link.anchor_text || !link.slug) continue;
    const url = `${wpUrl.replace(/\/+$/, '')}/${link.slug}`;
    // Skip if already linked
    if (result.includes(`href="${url}"`)) continue;
    // Replace first bare occurrence of the anchor text (case-insensitive)
    const escaped = link.anchor_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(escaped, 'i'),
      `<a href="${url}">${link.anchor_text}</a>`
    );
  }
  return result;
}

async function buildNavMenu(
  pages: GeneratedPage[],
  client: WordPressClient,
  wpUrl: string
): Promise<void> {
  const base = wpUrl.replace(/\/+$/, '');
  const items: import('../types').MenuItem[] = [];
  let order = 1;

  const byType = (type: GeneratedPage['page_type']) => pages.filter((p) => p.page_type === type && p.wp_page_id);

  // Home
  const home = byType('homepage')[0];
  if (home) {
    items.push({ id: 'home', title: 'Home', page_id: home.wp_page_id, order: order++ });
  }

  // Services parent + children
  const services = byType('service');
  const serviceLocations = byType('service_location');
  if (services.length > 0 || serviceLocations.length > 0) {
    items.push({ id: 'services', title: 'Services', url: `${base}/services`, order: order++ });
    for (const p of services) {
      items.push({ title: p.h1 ?? p.slug, page_id: p.wp_page_id, parent: 'services', order: order++ });
    }
    for (const p of serviceLocations) {
      items.push({ title: p.h1 ?? p.slug, page_id: p.wp_page_id, parent: 'services', order: order++ });
    }
  }

  // Locations parent + children
  const locations = byType('location');
  if (locations.length > 0) {
    items.push({ id: 'locations', title: 'Areas Served', url: `${base}/locations`, order: order++ });
    for (const p of locations) {
      items.push({ title: p.h1 ?? p.slug, page_id: p.wp_page_id, parent: 'locations', order: order++ });
    }
  }

  // Utility pages
  const about = byType('about')[0];
  if (about) items.push({ title: 'About Us', page_id: about.wp_page_id, order: order++ });
  const faq = byType('faq')[0];
  if (faq) items.push({ title: 'FAQ', page_id: faq.wp_page_id, order: order++ });
  const contact = byType('contact')[0];
  if (contact) items.push({ title: 'Contact', page_id: contact.wp_page_id, order: order++ });

  if (items.length === 0) return;

  await client.createMenu('Main Navigation', items, 'primary');
}
