"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const uuid_1 = require("uuid");
exports.projectsRouter = (0, express_1.Router)();
exports.projectsRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    res.json(rows.map(parseProject));
});
exports.projectsRouter.post('/', (req, res) => {
    const body = req.body;
    if (!body.business_name || !body.industry) {
        return res.status(400).json({ error: 'business_name and industry are required' });
    }
    const db = (0, client_1.getDb)();
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    db.prepare(`
    INSERT INTO projects (id, business_name, industry, website_url, wordpress_url, primary_locale, secondary_locales, country, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
  `).run(id, body.business_name, body.industry, body.website_url ?? null, body.wordpress_url ?? null, body.primary_locale ?? 'en-US', JSON.stringify(body.secondary_locales ?? []), body.country ?? null, now, now);
    if (body.profile) {
        const profileId = (0, uuid_1.v4)();
        const p = body.profile;
        db.prepare(`
      INSERT INTO business_profiles (id, project_id, business_name, description, phone, email, booking_url, years_in_business, trust_points, brand_colors, logo_url, tone, target_customer, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(profileId, id, p.business_name ?? body.business_name, p.description ?? null, p.phone ?? null, p.email ?? null, p.booking_url ?? null, p.years_in_business ?? null, JSON.stringify(p.trust_points ?? []), JSON.stringify(p.brand_colors ?? {}), p.logo_url ?? null, p.tone ?? null, p.target_customer ?? null, JSON.stringify(p.data ?? {}));
    }
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(parseProject(project));
});
exports.projectsRouter.get('/:id', (req, res) => {
    const db = (0, client_1.getDb)();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    const profile = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(req.params.id);
    const services = db.prepare('SELECT * FROM services WHERE project_id = ? ORDER BY priority DESC, created_at ASC').all(req.params.id);
    const locations = db.prepare('SELECT * FROM locations WHERE project_id = ? ORDER BY priority DESC, city ASC').all(req.params.id);
    const wpConnection = db.prepare('SELECT * FROM wordpress_connections WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.id);
    res.json({
        ...parseProject(project),
        profile: profile ? parseProfile(profile) : null,
        services: services.map((s) => ({ ...s, secondary_keywords: tryParse(s.secondary_keywords, []) })),
        locations: locations.map((l) => ({ ...l, included: Boolean(l.included) })),
        wp_connection: wpConnection ?? null,
    });
});
exports.projectsRouter.put('/:id', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Project not found' });
    const body = req.body;
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
  `).run(body.business_name ?? null, body.industry ?? null, body.website_url ?? null, body.wordpress_url ?? null, body.primary_locale ?? null, body.secondary_locales ? JSON.stringify(body.secondary_locales) : null, body.country ?? null, now, req.params.id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(parseProject(project));
});
exports.projectsRouter.delete('/:id', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Project not found' });
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ deleted: true });
});
function parseProject(row) {
    return {
        ...row,
        secondary_locales: tryParse(row.secondary_locales, []),
    };
}
function parseProfile(row) {
    return {
        ...row,
        trust_points: tryParse(row.trust_points, []),
        brand_colors: tryParse(row.brand_colors, {}),
        data: tryParse(row.data, {}),
    };
}
function tryParse(val, fallback) {
    try {
        return val ? JSON.parse(val) : fallback;
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=projects.js.map