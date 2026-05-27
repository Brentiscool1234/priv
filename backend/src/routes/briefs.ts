import { Router } from 'express';
import { getDb, runTransaction } from '../db/client';
import { generateBrief } from '../engines/brief-engine';
import type { PagePlan, BusinessProfile, Service, Location } from '../types';

export const briefsRouter = Router({ mergeParams: true });

briefsRouter.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM page_briefs WHERE project_id = ? ORDER BY created_at ASC').all(( req.params as any).id);
  res.json(rows.map(parseBrief));
});

briefsRouter.post('/generate', (req, res) => {
  const db = getDb();
  const projectId = ( req.params as any).id;
  const { plan_ids } = req.body as { plan_ids?: string[] };

  let plansQuery = "SELECT * FROM page_plans WHERE project_id = ? AND status = 'approved'";
  const plans: PagePlan[] = plan_ids
    ? (db.prepare(`SELECT * FROM page_plans WHERE project_id = ? AND id IN (${plan_ids.map(() => '?').join(',')})`).all(projectId, ...plan_ids) as unknown as PagePlan[])
    : (db.prepare(plansQuery).all(projectId) as unknown as PagePlan[]);

  if (plans.length === 0) {
    return res.status(400).json({ error: 'No approved page plans found. Approve pages in the sitemap first.' });
  }

  const profile = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId) as unknown as BusinessProfile | undefined;
  const services = (db.prepare('SELECT * FROM services WHERE project_id = ?').all(projectId) as unknown as Service[]).map(parseService);
  const locations = (db.prepare('SELECT * FROM locations WHERE project_id = ?').all(projectId) as unknown as Location[]).map(parseLocation);

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO page_briefs
    (id, plan_id, project_id, page_type, locale, slug, primary_keyword, secondary_keywords, h1, meta_title, meta_description, section_structure, cta_angle, faq_questions, internal_links, schema_types, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultProfile: BusinessProfile = profile
    ? { ...profile, trust_points: tryParse(profile.trust_points, []), brand_colors: tryParse(profile.brand_colors, {}), data: tryParse(profile.data, {}) }
    : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };

  const generated: unknown[] = [];
  runTransaction(db, () => {
    for (const plan of plans) {
      const brief = generateBrief({
        plan,
        businessProfile: defaultProfile,
        service: plan.service_id ? serviceMap.get(plan.service_id) : undefined,
        location: plan.location_id ? locationMap.get(plan.location_id) : undefined,
        allPlans: plans,
      });
      insertStmt.run(
        brief.id, brief.plan_id, brief.project_id, brief.page_type, brief.locale, brief.slug,
        brief.primary_keyword ?? null,
        JSON.stringify(brief.secondary_keywords),
        brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null,
        JSON.stringify(brief.section_structure),
        brief.cta_angle ?? null,
        JSON.stringify(brief.faq_questions),
        JSON.stringify(brief.internal_links),
        JSON.stringify(brief.schema_types),
        brief.status, brief.created_at
      );
      generated.push({ id: brief.id, slug: brief.slug, h1: brief.h1 });
    }
  });
  res.json({ generated: generated.length, briefs: generated });
});

briefsRouter.get('/:briefId', (req, res) => {
  const db = getDb();
  const brief = db.prepare('SELECT * FROM page_briefs WHERE id = ? AND project_id = ?').get(( req.params as any).briefId, ( req.params as any).id);
  if (!brief) return res.status(404).json({ error: 'Brief not found' });
  res.json(parseBrief(brief));
});

briefsRouter.put('/:briefId', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM page_briefs WHERE id = ? AND project_id = ?').get(( req.params as any).briefId, ( req.params as any).id);
  if (!existing) return res.status(404).json({ error: 'Brief not found' });
  const { h1, meta_title, meta_description, primary_keyword, faq_questions, status } = req.body;
  db.prepare(`
    UPDATE page_briefs SET
      h1 = COALESCE(?, h1),
      meta_title = COALESCE(?, meta_title),
      meta_description = COALESCE(?, meta_description),
      primary_keyword = COALESCE(?, primary_keyword),
      faq_questions = COALESCE(?, faq_questions),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(
    h1 ?? null, meta_title ?? null, meta_description ?? null,
    primary_keyword ?? null,
    faq_questions ? JSON.stringify(faq_questions) : null,
    status ?? null, ( req.params as any).briefId
  );
  const brief = db.prepare('SELECT * FROM page_briefs WHERE id = ?').get(( req.params as any).briefId);
  res.json(parseBrief(brief));
});

function parseBrief(row: any) {
  return {
    ...row,
    secondary_keywords: tryParse(row.secondary_keywords, []),
    section_structure: tryParse(row.section_structure, []),
    faq_questions: tryParse(row.faq_questions, []),
    internal_links: tryParse(row.internal_links, []),
    schema_types: tryParse(row.schema_types, []),
  };
}

function parseService(row: any) { return { ...row, secondary_keywords: tryParse(row.secondary_keywords, []) }; }
function parseLocation(row: any) { return { ...row, included: Boolean(row.included) }; }
function tryParse(val: unknown, fallback: unknown) {
  try { return val ? JSON.parse(val as string) : fallback; } catch { return fallback; }
}
