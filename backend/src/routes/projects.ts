import { Router } from 'express';
import { getDb } from '../db/client';
import { v4 as uuidv4 } from 'uuid';
import type { CreateProjectBody } from '../types';

export const projectsRouter = Router();

projectsRouter.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(rows.map(parseProject));
});

projectsRouter.post('/', (req, res) => {
  const body = req.body as CreateProjectBody;
  if (!body.business_name || !body.industry) {
    return res.status(400).json({ error: 'business_name and industry are required' });
  }
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO projects (id, business_name, industry, website_url, wordpress_url, primary_locale, secondary_locales, country, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
  `).run(
    id, body.business_name, body.industry,
    body.website_url ?? null, body.wordpress_url ?? null,
    body.primary_locale ?? 'en-US',
    JSON.stringify(body.secondary_locales ?? []),
    body.country ?? null, now, now
  );

  if (body.profile) {
    const profileId = uuidv4();
    const p = body.profile;
    db.prepare(`
      INSERT INTO business_profiles (id, project_id, business_name, description, phone, email, booking_url, years_in_business, trust_points, brand_colors, logo_url, tone, target_customer, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profileId, id,
      p.business_name ?? body.business_name,
      p.description ?? null, p.phone ?? null, p.email ?? null,
      p.booking_url ?? null, p.years_in_business ?? null,
      JSON.stringify(p.trust_points ?? []),
      JSON.stringify(p.brand_colors ?? {}),
      p.logo_url ?? null, p.tone ?? null, p.target_customer ?? null,
      JSON.stringify(p.data ?? {})
    );
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.status(201).json(parseProject(project));
});

projectsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const profile = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(req.params.id);
  res.json({ ...parseProject(project), profile: profile ? parseProfile(profile) : null });
});

projectsRouter.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  const body = req.body as Partial<CreateProjectBody>;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE projects SET
      business_name = COALESCE(?, business_name),
      industry = COALESCE(?, industry),
      website_url = COALESCE(?, website_url),
      wordpress_url = COALESCE(?, wordpress_url),
      primary_locale = COALESCE(?, primary_locale),
      secondary_locales = COALESCE(?, secondary_locales),
      country = COALESCE(?, country),
      updated_at = ?
    WHERE id = ?
  `).run(
    body.business_name ?? null, body.industry ?? null,
    body.website_url ?? null, body.wordpress_url ?? null,
    body.primary_locale ?? null,
    body.secondary_locales ? JSON.stringify(body.secondary_locales) : null,
    body.country ?? null, now, req.params.id
  );
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(parseProject(project));
});

projectsRouter.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

function parseProject(row: any) {
  return {
    ...row,
    secondary_locales: tryParse(row.secondary_locales, []),
  };
}

function parseProfile(row: any) {
  return {
    ...row,
    trust_points: tryParse(row.trust_points, []),
    brand_colors: tryParse(row.brand_colors, {}),
    data: tryParse(row.data, {}),
  };
}

function tryParse(val: unknown, fallback: unknown) {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}
