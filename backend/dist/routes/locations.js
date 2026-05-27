"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const uuid_1 = require("uuid");
exports.locationsRouter = (0, express_1.Router)({ mergeParams: true });
exports.locationsRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const rows = db.prepare('SELECT * FROM locations WHERE project_id = ? ORDER BY priority DESC, city ASC').all(req.params.id);
    res.json(rows.map(parseLocation));
});
exports.locationsRouter.post('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const body = req.body;
    if (!body.city)
        return res.status(400).json({ error: 'city is required' });
    const id = (0, uuid_1.v4)();
    db.prepare(`
    INSERT INTO locations (id, project_id, city, state_province, country, region, language_name, population, priority, included, locale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, body.city, body.state_province ?? null, body.country ?? null, body.region ?? null, body.language_name ?? null, body.population ?? null, body.priority ?? 1, 1, body.locale ?? null, new Date().toISOString());
    const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    res.status(201).json(parseLocation(loc));
});
exports.locationsRouter.post('/import-csv', (req, res) => {
    const db = (0, client_1.getDb)();
    const { rows } = req.body;
    if (!Array.isArray(rows))
        return res.status(400).json({ error: 'rows array required' });
    const created = [];
    const stmt = db.prepare(`
    INSERT INTO locations (id, project_id, city, state_province, country, region, priority, included, locale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const tx = db.transaction(() => {
        for (const row of rows) {
            if (!row.city)
                continue;
            const id = (0, uuid_1.v4)();
            stmt.run(id, req.params.id, row.city, row.state_province ?? null, row.country ?? null, row.region ?? null, row.priority ?? 1, 1, row.locale ?? null, new Date().toISOString());
            created.push({ id, city: row.city });
        }
    });
    tx();
    res.status(201).json({ created: created.length, items: created });
});
exports.locationsRouter.put('/:locationId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM locations WHERE id = ? AND project_id = ?').get(req.params.locationId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Location not found' });
    const body = req.body;
    db.prepare(`
    UPDATE locations SET
      city = COALESCE(?, city),
      state_province = COALESCE(?, state_province),
      country = COALESCE(?, country),
      priority = COALESCE(?, priority),
      included = COALESCE(?, included)
    WHERE id = ?
  `).run(body.city ?? null, body.state_province ?? null, body.country ?? null, body.priority ?? null, body.included !== undefined ? (body.included ? 1 : 0) : null, req.params.locationId);
    const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.locationId);
    res.json(parseLocation(loc));
});
exports.locationsRouter.delete('/:locationId', (req, res) => {
    const db = (0, client_1.getDb)();
    const existing = db.prepare('SELECT id FROM locations WHERE id = ? AND project_id = ?').get(req.params.locationId, req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Location not found' });
    db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.locationId);
    res.json({ deleted: true });
});
function parseLocation(row) {
    return { ...row, included: Boolean(row.included) };
}
//# sourceMappingURL=locations.js.map