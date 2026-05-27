"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployPages = deployPages;
const uuid_1 = require("uuid");
const client_1 = require("./client");
const logger_1 = require("../lib/logger");
const client_2 = require("../db/client");
/**
 * Deploy generated pages to WordPress.
 * Returns the deployment record with status.
 */
async function deployPages(projectId, wpUrl, pluginKey, profile, opts = {}) {
    const db = (0, client_2.getDb)();
    const client = new client_1.WordPressClient(wpUrl, pluginKey);
    const deployId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    // ── Fetch pages to deploy ──────────────────────────────────────────────────
    let pages;
    if (opts.page_ids && opts.page_ids.length > 0) {
        const placeholders = opts.page_ids.map(() => '?').join(',');
        const rows = db
            .prepare(`SELECT * FROM generated_pages WHERE project_id = ? AND id IN (${placeholders})`)
            .all(projectId, ...opts.page_ids);
        pages = rows.map(deserializePage);
    }
    else {
        const statusClause = opts.force ? '' : `AND status != 'deployed'`;
        const rows = db
            .prepare(`SELECT * FROM generated_pages WHERE project_id = ? AND status = 'done' ${statusClause}`)
            .all(projectId);
        pages = rows.map(deserializePage);
    }
    // ── Create deployment record ───────────────────────────────────────────────
    const deployment = {
        id: deployId,
        project_id: projectId,
        status: 'running',
        pages_total: pages.length,
        pages_created: 0,
        pages_failed: 0,
        log: [],
        started_at: now,
        created_at: now,
    };
    db.prepare(`INSERT INTO deployments (id, project_id, status, pages_total, pages_created, pages_failed, log, started_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(deployment.id, deployment.project_id, deployment.status, deployment.pages_total, deployment.pages_created, deployment.pages_failed, JSON.stringify(deployment.log), deployment.started_at, deployment.created_at);
    logger_1.logger.info(`Deployment ${deployId} started for project ${projectId}: ${pages.length} pages`);
    // ── Deploy in batches of 10 ────────────────────────────────────────────────
    const BATCH_SIZE = 10;
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
        const batch = pages.slice(i, i + BATCH_SIZE);
        const wpPages = batch.map((p) => pageToWPData(p, profile));
        try {
            const result = await client.bulkCreatePages(wpPages);
            for (const created of result.created) {
                const entry = {
                    ts: new Date().toISOString(),
                    slug: created.slug,
                    status: 'ok',
                    wp_page_id: created.id,
                };
                deployment.log.push(entry);
                deployment.pages_created++;
                // Update generated_page record
                db.prepare(`UPDATE generated_pages SET wp_page_id = ?, status = 'deployed', updated_at = ? WHERE project_id = ? AND slug = ?`).run(created.id, entry.ts, projectId, created.slug);
            }
            for (const failed of result.failed) {
                const entry = {
                    ts: new Date().toISOString(),
                    slug: failed.slug,
                    status: 'failed',
                    message: failed.error,
                };
                deployment.log.push(entry);
                deployment.pages_failed++;
                logger_1.logger.warn(`Failed to deploy ${failed.slug}: ${failed.error}`);
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger_1.logger.error(`Batch deploy error: ${msg}`);
            for (const p of batch) {
                deployment.log.push({
                    ts: new Date().toISOString(),
                    slug: p.slug,
                    status: 'failed',
                    message: msg,
                });
                deployment.pages_failed++;
            }
        }
        // Persist progress
        db.prepare(`UPDATE deployments SET pages_created = ?, pages_failed = ?, log = ? WHERE id = ?`).run(deployment.pages_created, deployment.pages_failed, JSON.stringify(deployment.log), deployId);
    }
    // ── Finalize ───────────────────────────────────────────────────────────────
    const completedAt = new Date().toISOString();
    deployment.status = deployment.pages_failed === 0 ? 'done' : 'failed';
    deployment.completed_at = completedAt;
    db.prepare(`UPDATE deployments SET status = ?, completed_at = ?, log = ? WHERE id = ?`).run(deployment.status, completedAt, JSON.stringify(deployment.log), deployId);
    // Update project page_count
    db.prepare(`UPDATE projects SET page_count = ?, updated_at = ? WHERE id = ?`).run(deployment.pages_created, completedAt, projectId);
    logger_1.logger.info(`Deployment ${deployId} finished: ${deployment.pages_created} created, ${deployment.pages_failed} failed`);
    return deployment;
}
// ─── Serialization helpers ────────────────────────────────────────────────────
function deserializePage(row) {
    return {
        id: row['id'],
        brief_id: row['brief_id'],
        project_id: row['project_id'],
        locale: row['locale'],
        slug: row['slug'],
        page_type: row['page_type'],
        h1: row['h1'],
        meta_title: row['meta_title'],
        meta_description: row['meta_description'],
        content_html: row['content_html'],
        schema_json: row['schema_json'] ? JSON.parse(row['schema_json']) : undefined,
        internal_links: row['internal_links'] ? JSON.parse(row['internal_links']) : [],
        status: row['status'],
        wp_page_id: row['wp_page_id'],
        created_at: row['created_at'],
        updated_at: row['updated_at'],
    };
}
function pageToWPData(page, _profile) {
    return {
        slug: page.slug,
        title: page.meta_title ?? page.h1 ?? page.slug,
        content: page.content_html ?? '',
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        schema_json: page.schema_json,
        status: 'publish',
    };
}
//# sourceMappingURL=deployer.js.map