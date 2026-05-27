"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitemapRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const sitemap_engine_1 = require("../engines/sitemap-engine");
exports.sitemapRouter = (0, express_1.Router)({ mergeParams: true });
exports.sitemapRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const plans = db.prepare('SELECT * FROM page_plans WHERE project_id = ? ORDER BY priority DESC, page_type ASC').all(req.params.id);
    res.json(plans);
});
exports.sitemapRouter.post('/generate', (req, res) => {
    const db = (0, client_1.getDb)();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    const rawProject = { ...project, secondary_locales: tryParse(project.secondary_locales, []) };
    const services = db.prepare('SELECT * FROM services WHERE project_id = ?').all(req.params.id).map(parseService);
    const locations = db.prepare('SELECT * FROM locations WHERE project_id = ? AND included = 1').all(req.params.id).map(parseLocation);
    const opts = {
        max_pages: req.body?.max_pages ?? 200,
        include_locales: req.body?.include_locales,
    };
    const plans = (0, sitemap_engine_1.generateSitemap)(rawProject, services, locations, opts);
    // Clear existing proposed plans and insert new ones
    db.prepare("DELETE FROM page_plans WHERE project_id = ? AND status = 'proposed'").run(req.params.id);
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
exports.sitemapRouter.put('/:planId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM page_plans WHERE id = ? AND project_id = ?').get(req.params.planId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Page plan not found' });
    const { status, slug, priority } = req.body;
    db.prepare(`
    UPDATE page_plans SET
      status = COALESCE(?, status),
      slug = COALESCE(?, slug),
      priority = COALESCE(?, priority)
    WHERE id = ?
  `).run(status ?? null, slug ?? null, priority ?? null, req.params.planId);
    const plan = db.prepare('SELECT * FROM page_plans WHERE id = ?').get(req.params.planId);
    res.json(plan);
});
exports.sitemapRouter.post('/approve-all', (req, res) => {
    const db = (0, client_1.getDb)();
    const result = db.prepare("UPDATE page_plans SET status = 'approved' WHERE project_id = ? AND status = 'proposed'").run(req.params.id);
    res.json({ approved: result.changes });
});
exports.sitemapRouter.delete('/:planId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM page_plans WHERE id = ? AND project_id = ?').get(req.params.planId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Page plan not found' });
    db.prepare('DELETE FROM page_plans WHERE id = ?').run(req.params.planId);
    res.json({ deleted: true });
});
function tryParse(val, fallback) {
    try {
        return val ? JSON.parse(val) : fallback;
    }
    catch {
        return fallback;
    }
}
function parseService(row) { return { ...row, secondary_keywords: tryParse(row.secondary_keywords, []) }; }
function parseLocation(row) { return { ...row, included: Boolean(row.included) }; }
//# sourceMappingURL=sitemap.js.map