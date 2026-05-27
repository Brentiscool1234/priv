"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.briefsRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const brief_engine_1 = require("../engines/brief-engine");
exports.briefsRouter = (0, express_1.Router)({ mergeParams: true });
exports.briefsRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const rows = db.prepare('SELECT * FROM page_briefs WHERE project_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json(rows.map(parseBrief));
});
exports.briefsRouter.post('/generate', (req, res) => {
    const db = (0, client_1.getDb)();
    const projectId = req.params.id;
    const { plan_ids } = req.body;
    let plansQuery = "SELECT * FROM page_plans WHERE project_id = ? AND status = 'approved'";
    const plans = plan_ids
        ? db.prepare(`SELECT * FROM page_plans WHERE project_id = ? AND id IN (${plan_ids.map(() => '?').join(',')})`).all(projectId, ...plan_ids)
        : db.prepare(plansQuery).all(projectId);
    if (plans.length === 0) {
        return res.status(400).json({ error: 'No approved page plans found. Approve pages in the sitemap first.' });
    }
    const profile = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId);
    const services = db.prepare('SELECT * FROM services WHERE project_id = ?').all(projectId).map(parseService);
    const locations = db.prepare('SELECT * FROM locations WHERE project_id = ?').all(projectId).map(parseLocation);
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    const locationMap = new Map(locations.map((l) => [l.id, l]));
    const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO page_briefs
    (id, plan_id, project_id, page_type, locale, slug, primary_keyword, secondary_keywords, h1, meta_title, meta_description, section_structure, cta_angle, faq_questions, internal_links, schema_types, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const defaultProfile = profile
        ? { ...profile, trust_points: tryParse(profile.trust_points, []), brand_colors: tryParse(profile.brand_colors, {}), data: tryParse(profile.data, {}) }
        : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };
    const generated = [];
    const tx = db.transaction(() => {
        for (const plan of plans) {
            const brief = (0, brief_engine_1.generateBrief)({
                plan,
                businessProfile: defaultProfile,
                service: plan.service_id ? serviceMap.get(plan.service_id) : undefined,
                location: plan.location_id ? locationMap.get(plan.location_id) : undefined,
                allPlans: plans,
            });
            insertStmt.run(brief.id, brief.plan_id, brief.project_id, brief.page_type, brief.locale, brief.slug, brief.primary_keyword ?? null, JSON.stringify(brief.secondary_keywords), brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null, JSON.stringify(brief.section_structure), brief.cta_angle ?? null, JSON.stringify(brief.faq_questions), JSON.stringify(brief.internal_links), JSON.stringify(brief.schema_types), brief.status, brief.created_at);
            generated.push({ id: brief.id, slug: brief.slug, h1: brief.h1 });
        }
    });
    tx();
    res.json({ generated: generated.length, briefs: generated });
});
exports.briefsRouter.get('/:briefId', (req, res) => {
    const db = (0, client_1.getDb)();
    const brief = db.prepare('SELECT * FROM page_briefs WHERE id = ? AND project_id = ?').get(req.params.briefId, req.params.id);
    if (!brief)
        return res.status(404).json({ error: 'Brief not found' });
    res.json(parseBrief(brief));
});
exports.briefsRouter.put('/:briefId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM page_briefs WHERE id = ? AND project_id = ?').get(req.params.briefId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Brief not found' });
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
  `).run(h1 ?? null, meta_title ?? null, meta_description ?? null, primary_keyword ?? null, faq_questions ? JSON.stringify(faq_questions) : null, status ?? null, req.params.briefId);
    const brief = db.prepare('SELECT * FROM page_briefs WHERE id = ?').get(req.params.briefId);
    res.json(parseBrief(brief));
});
function parseBrief(row) {
    return {
        ...row,
        secondary_keywords: tryParse(row.secondary_keywords, []),
        section_structure: tryParse(row.section_structure, []),
        faq_questions: tryParse(row.faq_questions, []),
        internal_links: tryParse(row.internal_links, []),
        schema_types: tryParse(row.schema_types, []),
    };
}
function parseService(row) { return { ...row, secondary_keywords: tryParse(row.secondary_keywords, []) }; }
function parseLocation(row) { return { ...row, included: Boolean(row.included) }; }
function tryParse(val, fallback) {
    try {
        return val ? JSON.parse(val) : fallback;
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=briefs.js.map