import { Router } from 'express';
import { getDb, runTransaction } from '../db/client';
import { v4 as uuidv4 } from 'uuid';
import type { CreateLocationBody } from '../types';

export const locationsRouter = Router({ mergeParams: true });

locationsRouter.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM locations WHERE project_id = ? ORDER BY priority DESC, city ASC').all(( req.params as any).id);
  res.json(rows.map(parseLocation));
});

locationsRouter.post('/', (req, res) => {
  const db = getDb();
  const body = req.body as CreateLocationBody;
  if (!body.city) return res.status(400).json({ error: 'city is required' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO locations (id, project_id, city, state_province, country, region, language_name, population, priority, included, locale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, ( req.params as any).id, body.city,
    body.state_province ?? null, body.country ?? null,
    body.region ?? null, body.language_name ?? null,
    body.population ?? null, body.priority ?? 1, 1,
    body.locale ?? null, new Date().toISOString()
  );
  const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
  res.status(201).json(parseLocation(loc));
});

locationsRouter.post('/import-csv', (req, res) => {
  const db = getDb();
  const { rows } = req.body as { rows: CreateLocationBody[] };
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
  const created: unknown[] = [];
  const stmt = db.prepare(`
    INSERT INTO locations (id, project_id, city, state_province, country, region, priority, included, locale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  runTransaction(db, () => {
    for (const row of rows) {
      if (!row.city) continue;
      const id = uuidv4();
      stmt.run(id, ( req.params as any).id, row.city, row.state_province ?? null, row.country ?? null, row.region ?? null, row.priority ?? 1, 1, row.locale ?? null, new Date().toISOString());
      created.push({ id, city: row.city });
    }
  });
  res.status(201).json({ created: created.length, items: created });
});

locationsRouter.put('/:locationId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM locations WHERE id = ? AND project_id = ?').get(( req.params as any).locationId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Location not found' });
  const body = req.body as Partial<CreateLocationBody> & { included?: boolean };
  db.prepare(`
    UPDATE locations SET
      city = COALESCE(?, city),
      state_province = COALESCE(?, state_province),
      country = COALESCE(?, country),
      priority = COALESCE(?, priority),
      included = COALESCE(?, included)
    WHERE id = ?
  `).run(
    body.city ?? null, body.state_province ?? null, body.country ?? null,
    body.priority ?? null, body.included !== undefined ? (body.included ? 1 : 0) : null,
    ( req.params as any).locationId
  );
  const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(( req.params as any).locationId);
  res.json(parseLocation(loc));
});

locationsRouter.delete('/:locationId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM locations WHERE id = ? AND project_id = ?').get(( req.params as any).locationId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Location not found' });
  db.prepare('DELETE FROM locations WHERE id = ?').run(( req.params as any).locationId);
  res.json({ deleted: true });
});

function parseLocation(row: any) {
  return { ...row, included: Boolean(row.included) };
}
