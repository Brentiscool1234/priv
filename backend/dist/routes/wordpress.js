"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordpressRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const client_2 = require("../wordpress/client");
const deployer_1 = require("../wordpress/deployer");
const uuid_1 = require("uuid");
const logger_1 = require("../lib/logger");
exports.wordpressRouter = (0, express_1.Router)({ mergeParams: true });
exports.wordpressRouter.post('/connect', async (req, res) => {
    try {
        const db = (0, client_1.getDb)();
        const body = req.body;
        if (!body.wp_url || !body.plugin_key) {
            res.status(400).json({ error: 'wp_url and plugin_key are required' });
            return;
        }
        const client = new client_2.WordPressClient(body.wp_url, body.plugin_key);
        const test = await client.testConnection();
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const status = test.success ? 'ok' : 'error';
        // Upsert connection record
        const existing = db.prepare('SELECT id FROM wordpress_connections WHERE project_id = ?').get(req.params.id);
        if (existing) {
            db.prepare('UPDATE wordpress_connections SET wp_url = ?, plugin_key = ?, status = ?, last_checked = ? WHERE project_id = ?')
                .run(body.wp_url, body.plugin_key, status, now, req.params.id);
        }
        else {
            db.prepare('INSERT INTO wordpress_connections (id, project_id, wp_url, plugin_key, status, last_checked, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .run(id, req.params.id, body.wp_url, body.plugin_key, status, now, now);
        }
        res.json({ connected: test.success, message: test.message });
    }
    catch (err) {
        logger_1.logger.error('WP connect error', { err });
        res.status(500).json({ error: String(err) });
    }
});
exports.wordpressRouter.get('/status', async (req, res) => {
    const db = (0, client_1.getDb)();
    const conn = db.prepare('SELECT * FROM wordpress_connections WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.id);
    if (!conn)
        return res.json({ connected: false, message: 'No WordPress connection configured' });
    const client = new client_2.WordPressClient(conn.wp_url, conn.plugin_key);
    const test = await client.testConnection();
    res.json({ connected: test.success, message: test.message, wp_url: conn.wp_url });
});
exports.wordpressRouter.post('/deploy', async (req, res) => {
    try {
        const db = (0, client_1.getDb)();
        const projectId = req.params.id;
        const body = req.body;
        const conn = db.prepare('SELECT * FROM wordpress_connections WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(projectId);
        if (!conn) {
            res.status(400).json({ error: 'No WordPress connection configured. Use POST /wp/connect first.' });
            return;
        }
        const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId);
        const profile = profileRow
            ? {
                id: profileRow['id'],
                project_id: projectId,
                business_name: profileRow['business_name'],
                description: profileRow['description'],
                phone: profileRow['phone'],
                email: profileRow['email'],
                booking_url: profileRow['booking_url'],
                years_in_business: profileRow['years_in_business'],
                trust_points: tryParse(profileRow['trust_points'], []),
                brand_colors: tryParse(profileRow['brand_colors'], {}),
                logo_url: profileRow['logo_url'],
                tone: profileRow['tone'],
                target_customer: profileRow['target_customer'],
                data: tryParse(profileRow['data'], {}),
            }
            : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };
        const deployment = await (0, deployer_1.deployPages)(projectId, conn.wp_url, conn.plugin_key, profile, {
            page_ids: body.page_ids,
            force: body.force,
        });
        res.json(deployment);
    }
    catch (err) {
        logger_1.logger.error('Deploy error', { err });
        res.status(500).json({ error: String(err) });
    }
});
exports.wordpressRouter.get('/deploy/:deployId', (req, res) => {
    const db = (0, client_1.getDb)();
    const dep = db.prepare('SELECT * FROM deployments WHERE id = ? AND project_id = ?').get(req.params.deployId, req.params.id);
    if (!dep)
        return res.status(404).json({ error: 'Deployment not found' });
    res.json({ ...dep, log: tryParse(dep.log, []) });
});
function tryParse(val, fallback) {
    try {
        return val ? JSON.parse(val) : fallback;
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=wordpress.js.map