import { Router } from 'express';
import { getDb } from '../db/client';
import { generateSitemap } from '../engines/sitemap-engine';
import type { Project, Service, Location, PagePlan } from '../types';

export const sitemapRouter = Router({ mergeParams: true });

sitemapRouter.get('/', (req, res) => {
  const db = getDb();
  const plans = db.prepare('SELECT * FROM page_plans WHERE project_id = ? ORDER BY priority DESC, page_type ASC').all(( req.params as any).id);
  res.json(plans);
});

sitemapRouter.post('/generate', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(( req.params as any).id) as Project | undefined;
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const rawProject = { ...project, secondary_locales: tryParse(project.secondary_locales, []) } as Project;
  const services = (db.prepare('SELECT * FROM services WHERE project_id = ?').all(( req.params as any).id) as Service[]).map(parseService);
  const locations = (db.prepare('SELECT * FROM locations WHERE project_id = ? AND included = 1').all(( req.params as any).id) as Location[]).map(parseLocation);

  const opts = {
    max_pages: req.body?.max_pages ?? 200,
    include_locales: req.body?.include_locales,
  };

  const plans = generateSitemap(rawProject, services, locations, opts);

  // Clear existing proposed plans and insert new ones
  db.prepare("DELETE FROM page_plans WHERE project_id = ? AND status = 'proposed'").run(( req.params as any).id);

  const insertStmt = db.prepare(`
    INSERT INTO page_plans (id, project_id, page_type, locale, service_id, location_id, slug, status, priority, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction(() => {
    for (const p of plans) {
      insertStmt.run(p.id, p.project_id, p.page_type, p.locale, p.service_id ?? null, p.location_id ?? null, p.slug, p.status, p.priority, p.created_at);
    }
  });
  tx();

  res.json({ generated: plans.length, plans });
});

sitemapRouter.put('/:planId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM page_plans WHERE id = ? AND project_id = ?').get(( req.params as any).planId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Page plan not found' });
  const { status, slug, priority } = req.body as Partial<PagePlan>;
  db.prepare(`
    UPDATE page_plans SET
      status = COALESCE(?, status),
      slug = COALESCE(?, slug),
      priority = COALESCE(?, priority)
    WHERE id = ?
  `).run(status ?? null, slug ?? null, priority ?? null, ( req.params as any).planId);
  const plan = db.prepare('SELECT * FROM page_plans WHERE id = ?').get(( req.params as any).planId);
  res.json(plan);
});

sitemapRouter.post('/approve-all', (req, res) => {
  const db = getDb();
  const result = db.prepare("UPDATE page_plans SET status = 'approved' WHERE project_id = ? AND status = 'proposed'").run(( req.params as any).id);
  res.json({ approved: result.changes });
});

sitemapRouter.delete('/:planId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM page_plans WHERE id = ? AND project_id = ?').get(( req.params as any).planId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Page plan not found' });
  db.prepare('DELETE FROM page_plans WHERE id = ?').run(( req.params as any).planId);
  res.json({ deleted: true });
});

function tryParse(val: unknown, fallback: unknown) {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}
function parseService(row: any) { return { ...row, secondary_keywords: tryParse(row.secondary_keywords, []) }; }
function parseLocation(row: any) { return { ...row, included: Boolean(row.included) }; }
