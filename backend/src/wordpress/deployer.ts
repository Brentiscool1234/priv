import { v4 as uuidv4 } from 'uuid';
import { WordPressClient } from './client';
import { logger } from '../lib/logger';
import { getDb } from '../db/client';
import { THEMES } from '../lib/themes';
import type {
  GeneratedPage,
  BusinessProfile,
  Deployment,
  DeployLogEntry,
  WPPageData,
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
    const statusClause = opts.force ? '' : `AND status != 'deployed'`;
    const rows = db
      .prepare(`SELECT * FROM generated_pages WHERE project_id = ? AND status = 'done' ${statusClause}`)
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
    await client.pushSettings({ theme_css: THEMES[theme]?.css ?? THEMES.horizon.css });
    logger.info(`Theme CSS (${theme}) pushed to WordPress before deployment`);
  } catch (cssErr) {
    logger.warn('Could not push theme CSS before deployment (non-fatal)', { cssErr });
  }

  // ── Deploy in batches of 10 ────────────────────────────────────────────────
  const BATCH_SIZE = 10;
  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    const wpPages: WPPageData[] = batch.map((p) => pageToWPData(p, profile));

    try {
      const result = await client.bulkCreatePages(wpPages);

      for (const created of result.created) {
        const entry: DeployLogEntry = {
          ts: new Date().toISOString(),
          slug: created.slug,
          status: 'ok',
          wp_page_id: created.id,
        };
        deployment.log.push(entry);
        deployment.pages_created++;

        // Update generated_page record
        db.prepare(
          `UPDATE generated_pages SET wp_page_id = ?, status = 'deployed', updated_at = ? WHERE project_id = ? AND slug = ?`
        ).run(created.id, entry.ts, projectId, created.slug);
      }

      for (const failed of result.failed) {
        const entry: DeployLogEntry = {
          ts: new Date().toISOString(),
          slug: failed.slug,
          status: 'failed',
          message: failed.error,
        };
        deployment.log.push(entry);
        deployment.pages_failed++;
        logger.warn(`Failed to deploy ${failed.slug}: ${failed.error}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Batch deploy error: ${msg}`);

      for (const p of batch) {
        deployment.log.push({
          ts: new Date().toISOString(),
          slug: p.slug,
          status: 'failed',
          message: msg,
        });
        deployment.pages_failed++;
      }
    }

    // Persist progress
    db.prepare(
      `UPDATE deployments SET pages_created = ?, pages_failed = ?, log = ? WHERE id = ?`
    ).run(deployment.pages_created, deployment.pages_failed, JSON.stringify(deployment.log), deployId);
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
    internal_links: row['internal_links'] ? JSON.parse(row['internal_links'] as string) : [],
    status: row['status'] as GeneratedPage['status'],
    wp_page_id: row['wp_page_id'] as number | undefined,
    created_at: row['created_at'] as string,
    updated_at: row['updated_at'] as string,
  };
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
