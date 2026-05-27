"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicesRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const uuid_1 = require("uuid");
const locale_engine_1 = require("../engines/locale-engine");
exports.servicesRouter = (0, express_1.Router)({ mergeParams: true });
exports.servicesRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const rows = db.prepare('SELECT * FROM services WHERE project_id = ? ORDER BY priority DESC, created_at ASC').all(req.params.id);
    res.json(rows.map(parseService));
});
exports.servicesRouter.post('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const body = req.body;
    if (!body.name || !body.locale)
        return res.status(400).json({ error: 'name and locale are required' });
    const id = (0, uuid_1.v4)();
    const slug = body.slug ?? (0, locale_engine_1.slugify)(body.name, body.locale);
    db.prepare(`
    INSERT INTO services (id, project_id, name, locale, primary_keyword, secondary_keywords, slug, description, parent_category, priority, template_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, body.name, body.locale, body.primary_keyword ?? body.name, JSON.stringify(body.secondary_keywords ?? []), slug, body.description ?? null, body.parent_category ?? null, body.priority ?? 1, body.template_type ?? 'service', new Date().toISOString());
    const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.status(201).json(parseService(svc));
});
exports.servicesRouter.post('/import-csv', (req, res) => {
    const db = (0, client_1.getDb)();
    const { rows, locale = 'en-US' } = req.body;
    if (!Array.isArray(rows))
        return res.status(400).json({ error: 'rows array required' });
    const created = [];
    const insertStmt = db.prepare(`
    INSERT INTO services (id, project_id, name, locale, primary_keyword, secondary_keywords, slug, description, priority, template_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const tx = db.transaction(() => {
        for (const row of rows) {
            if (!row.name)
                continue;
            const id = (0, uuid_1.v4)();
            const slug = row.slug ?? (0, locale_engine_1.slugify)(row.name, locale);
            insertStmt.run(id, req.params.id, row.name, locale, row.primary_keyword ?? row.name, '[]', slug, row.description ?? null, row.priority ?? 1, 'service', new Date().toISOString());
            created.push({ id, name: row.name, slug });
        }
    });
    tx();
    res.status(201).json({ created: created.length, items: created });
});
exports.servicesRouter.put('/:serviceId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM services WHERE id = ? AND project_id = ?').get(req.params.serviceId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Service not found' });
    const body = req.body;
    db.prepare(`
    UPDATE services SET
      name = COALESCE(?, name),
      primary_keyword = COALESCE(?, primary_keyword),
      secondary_keywords = COALESCE(?, secondary_keywords),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      priority = COALESCE(?, priority)
    WHERE id = ?
  `).run(body.name ?? null, body.primary_keyword ?? null, body.secondary_keywords ? JSON.stringify(body.secondary_keywords) : null, body.slug ?? null, body.description ?? null, body.priority ?? null, req.params.serviceId);
    const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.serviceId);
    res.json(parseService(svc));
});
exports.servicesRouter.delete('/:serviceId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM services WHERE id = ? AND project_id = ?').get(req.params.serviceId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Service not found' });
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.serviceId);
    res.json({ deleted: true });
});
function parseService(row) {
    return {
        ...row,
        secondary_keywords: tryParse(row.secondary_keywords, []),
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
//# sourceMappingURL=services.js.map