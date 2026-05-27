import { Router } from 'express';
import { getDb } from '../db/client';
import { v4 as uuidv4 } from 'uuid';
import type { CreateServiceBody } from '../types';
import { slugify } from '../engines/locale-engine';

export const servicesRouter = Router({ mergeParams: true });

servicesRouter.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM services WHERE project_id = ? ORDER BY priority DESC, created_at ASC').all(( req.params as any).id);
  res.json(rows.map(parseService));
});

servicesRouter.post('/', (req, res) => {
  const db = getDb();
  const body = req.body as CreateServiceBody;
  if (!body.name || !body.locale) return res.status(400).json({ error: 'name and locale are required' });
  const id = uuidv4();
  const slug = body.slug ?? slugify(body.name, body.locale);
  db.prepare(`
    INSERT INTO services (id, project_id, name, locale, primary_keyword, secondary_keywords, slug, description, parent_category, priority, template_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, ( req.params as any).id, body.name, body.locale,
    body.primary_keyword ?? body.name,
    JSON.stringify(body.secondary_keywords ?? []),
    slug, body.description ?? null,
    body.parent_category ?? null,
    body.priority ?? 1,
    body.template_type ?? 'service',
    new Date().toISOString()
  );
  const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.status(201).json(parseService(svc));
});

servicesRouter.post('/import-csv', (req, res) => {
  const db = getDb();
  const { rows, locale = 'en-US' } = req.body as { rows: Array<{ name: string; primary_keyword?: string; slug?: string; description?: string; priority?: number }>; locale?: string };
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const created: unknown[] = [];
  const insertStmt = db.prepare(`
    INSERT INTO services (id, project_id, name, locale, primary_keyword, secondary_keywords, slug, description, priority, template_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction(() => {
    for (const row of rows) {
      if (!row.name) continue;
      const id = uuidv4();
      const slug = row.slug ?? slugify(row.name, locale);
      insertStmt.run(id, ( req.params as any).id, row.name, locale, row.primary_keyword ?? row.name, '[]', slug, row.description ?? null, row.priority ?? 1, 'service', new Date().toISOString());
      created.push({ id, name: row.name, slug });
    }
  });
  tx();
  res.status(201).json({ created: created.length, items: created });
});

servicesRouter.put('/:serviceId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM services WHERE id = ? AND project_id = ?').get(( req.params as any).serviceId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });
  const body = req.body as Partial<CreateServiceBody>;
  db.prepare(`
    UPDATE services SET
      name = COALESCE(?, name),
      primary_keyword = COALESCE(?, primary_keyword),
      secondary_keywords = COALESCE(?, secondary_keywords),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      priority = COALESCE(?, priority)
    WHERE id = ?
  `).run(
    body.name ?? null, body.primary_keyword ?? null,
    body.secondary_keywords ? JSON.stringify(body.secondary_keywords) : null,
    body.slug ?? null, body.description ?? null, body.priority ?? null,
    ( req.params as any).serviceId
  );
  const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(( req.params as any).serviceId);
  res.json(parseService(svc));
});

servicesRouter.delete('/:serviceId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM services WHERE id = ? AND project_id = ?').get(( req.params as any).serviceId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });
  db.prepare('DELETE FROM services WHERE id = ?').run(( req.params as any).serviceId);
  res.json({ deleted: true });
});

function parseService(row: any) {
  return {
    ...row,
    secondary_keywords: tryParse(row.secondary_keywords, []),
  };
}

function tryParse(val: unknown, fallback: unknown) {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}
