import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, runTransaction } from '../db/client';
import { generateBatch } from '../engines/content-engine';
import { generateSchema } from '../engines/schema-engine';
import { logger } from '../lib/logger';
import type { PageBrief, BusinessProfile, GeneratedPage, PageImage, ThemeName } from '../types';

export const contentRouter = Router({ mergeParams: true });

contentRouter.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM generated_pages WHERE project_id = ? ORDER BY created_at ASC').all(( req.params as any).id);
  res.json(rows.map((r: any) => parsePage(r)));
});

contentRouter.post('/generate', async (req, res) => {
  try {
    const db = getDb();
    const projectId = ( req.params as any).id;
    const { brief_ids } = req.body as { brief_ids?: string[]; concurrency?: number };

    let rawBriefs: Record<string, unknown>[];
    if (brief_ids && brief_ids.length > 0) {
      const placeholders = brief_ids.map(() => '?').join(',');
      rawBriefs = db.prepare(`SELECT * FROM page_briefs WHERE project_id = ? AND id IN (${placeholders})`).all(projectId, ...brief_ids) as Record<string, unknown>[];
    } else {
      rawBriefs = db.prepare("SELECT * FROM page_briefs WHERE project_id = ? AND status = 'approved'").all(projectId) as Record<string, unknown>[];
    }

    if (rawBriefs.length === 0) {
      res.status(400).json({ error: 'No approved briefs found. Approve briefs before generating content.' });
      return;
    }

    const parsedBriefs = rawBriefs.map(parseBrief);

    const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId) as Record<string, unknown> | undefined;
    const defaultProfile: BusinessProfile = profileRow
      ? parseProfile(profileRow)
      : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };

    const projectRow = db.prepare('SELECT theme FROM projects WHERE id = ?').get(projectId) as { theme?: string } | undefined;
    const theme: ThemeName = (projectRow?.theme as ThemeName) ?? 'horizon';

    // Group by locale
    const byLocale = new Map<string, PageBrief[]>();
    for (const brief of parsedBriefs) {
      const arr = byLocale.get(brief.locale) ?? [];
      arr.push(brief);
      byLocale.set(brief.locale, arr);
    }

    const now = new Date().toISOString();

    // Pre-insert stub generated_pages rows
    runTransaction(db, () => {
      for (const brief of parsedBriefs) {
        const existing = db.prepare('SELECT id FROM generated_pages WHERE brief_id = ?').get(brief.id);
        if (!existing) {
          db.prepare(`INSERT INTO generated_pages (id, brief_id, project_id, locale, slug, page_type, h1, meta_title, meta_description, internal_links, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating', ?, ?)`)
            .run(uuidv4(), brief.id, projectId, brief.locale, brief.slug, brief.page_type,
              brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null,
              JSON.stringify(brief.internal_links), now, now);
        } else {
          db.prepare("UPDATE generated_pages SET status = 'generating', updated_at = ? WHERE brief_id = ?").run(now, brief.id);
        }
      }
    });

    res.json({ queued: parsedBriefs.length, message: 'Content generation started. Poll GET /content for status.' });

    setImmediate(async () => {
      for (const [locale, localeBriefs] of byLocale) {
        try {
          const results = await generateBatch(localeBriefs, defaultProfile, locale, theme);
          runTransaction(db, () => {
            for (const result of results) {
              const brief = localeBriefs.find((b) => b.id === result.brief_id);
              if (!brief) continue;
              const updatedAt = new Date().toISOString();
              if (result.success) {
                const pageRow = db.prepare('SELECT * FROM generated_pages WHERE brief_id = ?').get(brief.id) as Record<string, unknown> | undefined;
                const pagePlaceholder: GeneratedPage = {
                  id: (pageRow?.['id'] as string) ?? uuidv4(),
                  brief_id: brief.id,
                  project_id: projectId,
                  locale: brief.locale,
                  slug: brief.slug,
                  page_type: brief.page_type,
                  h1: brief.h1,
                  meta_title: brief.meta_title,
                  meta_description: brief.meta_description,
                  content_html: result.content_html,
                  schema_json: [],
                  internal_links: brief.internal_links,
                  status: 'done',
                  created_at: (pageRow?.['created_at'] as string) ?? updatedAt,
                  updated_at: updatedAt,
                };
                const schema = generateSchema({ ...pagePlaceholder, content_html: result.content_html }, defaultProfile, brief.locale);
                db.prepare(`UPDATE generated_pages SET content_html = ?, schema_json = ?, images_json = ?, h1 = ?, meta_title = ?, meta_description = ?, internal_links = ?, status = 'done', updated_at = ? WHERE brief_id = ?`)
                  .run(result.content_html, JSON.stringify(schema), JSON.stringify(result.images), brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null, JSON.stringify(brief.internal_links), updatedAt, brief.id);
              } else {
                db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE brief_id = ?").run(updatedAt, brief.id);
              }
            }
          });
          logger.info(`Content gen locale ${locale}: ${results.filter((r) => r.success).length}/${results.length} succeeded`);
        } catch (err) {
          logger.error(`Content generation error for locale ${locale}`, { err });
        }
      }
    });
  } catch (err) {
    logger.error('Failed to queue content generation', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

contentRouter.get('/:pageId/preview', (req, res) => {
  try {
    const db = getDb();
    const pageRow = db.prepare('SELECT * FROM generated_pages WHERE id = ? AND project_id = ?').get(( req.params as any).pageId, ( req.params as any).id) as Record<string, unknown> | undefined;
    if (!pageRow) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const page = parsePage(pageRow);
    if (!page.content_html) {
      res.status(400).json({ error: 'Page content not yet generated' });
      return;
    }
    const schemaScripts = (page.schema_json ?? [])
      .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
      .join('\n');
    const html = `<!DOCTYPE html>\n<html lang="${page.locale}">\n<head>\n<meta charset="UTF-8">\n<title>${page.meta_title ?? page.h1 ?? page.slug}</title>\n<meta name="description" content="${page.meta_description ?? ''}">\n<link rel="canonical" href="/${page.slug}">\n${schemaScripts}\n</head>\n<body>\n${page.content_html}\n</body>\n</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    logger.error('Preview error', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

contentRouter.post('/:pageId/regenerate', async (req, res) => {
  try {
    const db = getDb();
    const pageRow = db.prepare('SELECT * FROM generated_pages WHERE id = ? AND project_id = ?').get(( req.params as any).pageId, ( req.params as any).id) as Record<string, unknown> | undefined;
    if (!pageRow) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const page = parsePage(pageRow);
    const briefRow = db.prepare('SELECT * FROM page_briefs WHERE id = ?').get(page.brief_id) as Record<string, unknown> | undefined;
    if (!briefRow) {
      res.status(404).json({ error: 'Brief not found' });
      return;
    }
    const brief = parseBrief(briefRow);
    const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(( req.params as any).id) as Record<string, unknown> | undefined;
    const defaultProfile: BusinessProfile = profileRow
      ? parseProfile(profileRow)
      : { id: '', project_id: ( req.params as any).id, trust_points: [], brand_colors: {}, data: {} };

    db.prepare("UPDATE generated_pages SET status = 'generating', updated_at = ? WHERE id = ?").run(new Date().toISOString(), ( req.params as any).pageId);
    res.json({ message: 'Regeneration started', page_id: ( req.params as any).pageId });

    setImmediate(async () => {
      try {
        const results = await generateBatch([brief], defaultProfile, brief.locale);
        const result = results[0];
        const updatedAt = new Date().toISOString();
        if (result && result.success) {
          const schema = generateSchema({ ...page, content_html: result.content_html, images_json: result.images }, defaultProfile, brief.locale);
          db.prepare(`UPDATE generated_pages SET content_html = ?, schema_json = ?, images_json = ?, status = 'done', updated_at = ? WHERE id = ?`)
            .run(result.content_html, JSON.stringify(schema), JSON.stringify(result.images), updatedAt, ( req.params as any).pageId);
        } else {
          db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE id = ?").run(updatedAt, ( req.params as any).pageId);
        }
      } catch (err) {
        logger.error('Regeneration background error', { err });
        db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE id = ?").run(new Date().toISOString(), ( req.params as any).pageId);
      }
    });
  } catch (err) {
    logger.error('Regeneration error', { err });
    res.status(500).json({ error: 'Internal server error' });
  }
});

function parsePage(row: Record<string, unknown>): GeneratedPage {
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
    schema_json: tryParse(row['schema_json'], []) as object[],
    images_json: tryParse(row['images_json'], []) as PageImage[],
    internal_links: tryParse(row['internal_links'], []) as GeneratedPage['internal_links'],
    status: row['status'] as GeneratedPage['status'],
    wp_page_id: row['wp_page_id'] as number | undefined,
    created_at: row['created_at'] as string,
    updated_at: row['updated_at'] as string,
  };
}

function parseBrief(row: Record<string, unknown>): PageBrief {
  return {
    id: row['id'] as string,
    plan_id: row['plan_id'] as string,
    project_id: row['project_id'] as string,
    page_type: row['page_type'] as PageBrief['page_type'],
    locale: row['locale'] as string,
    slug: row['slug'] as string,
    primary_keyword: row['primary_keyword'] as string | undefined,
    secondary_keywords: tryParse(row['secondary_keywords'], []) as string[],
    h1: row['h1'] as string | undefined,
    meta_title: row['meta_title'] as string | undefined,
    meta_description: row['meta_description'] as string | undefined,
    section_structure: tryParse(row['section_structure'], []) as string[],
    cta_angle: row['cta_angle'] as string | undefined,
    faq_questions: tryParse(row['faq_questions'], []) as string[],
    internal_links: tryParse(row['internal_links'], []) as PageBrief['internal_links'],
    schema_types: tryParse(row['schema_types'], []) as string[],
    status: row['status'] as PageBrief['status'],
    created_at: row['created_at'] as string,
  };
}

function parseProfile(row: Record<string, unknown>): BusinessProfile {
  return {
    id: row['id'] as string,
    project_id: row['project_id'] as string,
    business_name: row['business_name'] as string | undefined,
    description: row['description'] as string | undefined,
    phone: row['phone'] as string | undefined,
    email: row['email'] as string | undefined,
    booking_url: row['booking_url'] as string | undefined,
    years_in_business: row['years_in_business'] as number | undefined,
    trust_points: tryParse(row['trust_points'], []) as string[],
    brand_colors: tryParse(row['brand_colors'], {}) as Record<string, string>,
    logo_url: row['logo_url'] as string | undefined,
    tone: row['tone'] as string | undefined,
    target_customer: row['target_customer'] as string | undefined,
    data: tryParse(row['data'], {}) as Record<string, unknown>,
  };
}

function tryParse(val: unknown, fallback: unknown): unknown {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}
