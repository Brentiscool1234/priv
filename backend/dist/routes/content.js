"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const client_1 = require("../db/client");
const content_engine_1 = require("../engines/content-engine");
const schema_engine_1 = require("../engines/schema-engine");
const logger_1 = require("../lib/logger");
exports.contentRouter = (0, express_1.Router)({ mergeParams: true });
exports.contentRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const rows = db.prepare('SELECT * FROM generated_pages WHERE project_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json(rows.map((r) => parsePage(r)));
});
exports.contentRouter.post('/generate', async (req, res) => {
    try {
        const db = (0, client_1.getDb)();
        const projectId = req.params.id;
        const { brief_ids } = req.body;
        let rawBriefs;
        if (brief_ids && brief_ids.length > 0) {
            const placeholders = brief_ids.map(() => '?').join(',');
            rawBriefs = db.prepare(`SELECT * FROM page_briefs WHERE project_id = ? AND id IN (${placeholders})`).all(projectId, ...brief_ids);
        }
        else {
            rawBriefs = db.prepare("SELECT * FROM page_briefs WHERE project_id = ? AND status = 'approved'").all(projectId);
        }
        if (rawBriefs.length === 0) {
            res.status(400).json({ error: 'No approved briefs found. Approve briefs before generating content.' });
            return;
        }
        const parsedBriefs = rawBriefs.map(parseBrief);
        const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(projectId);
        const defaultProfile = profileRow
            ? parseProfile(profileRow)
            : { id: '', project_id: projectId, trust_points: [], brand_colors: {}, data: {} };
        // Group by locale
        const byLocale = new Map();
        for (const brief of parsedBriefs) {
            const arr = byLocale.get(brief.locale) ?? [];
            arr.push(brief);
            byLocale.set(brief.locale, arr);
        }
        const now = new Date().toISOString();
        // Pre-insert stub generated_pages rows
        const initTx = db.transaction(() => {
            for (const brief of parsedBriefs) {
                const existing = db.prepare('SELECT id FROM generated_pages WHERE brief_id = ?').get(brief.id);
                if (!existing) {
                    db.prepare(`INSERT INTO generated_pages (id, brief_id, project_id, locale, slug, page_type, h1, meta_title, meta_description, internal_links, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generating', ?, ?)`)
                        .run((0, uuid_1.v4)(), brief.id, projectId, brief.locale, brief.slug, brief.page_type, brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null, JSON.stringify(brief.internal_links), now, now);
                }
                else {
                    db.prepare("UPDATE generated_pages SET status = 'generating', updated_at = ? WHERE brief_id = ?").run(now, brief.id);
                }
            }
        });
        initTx();
        res.json({ queued: parsedBriefs.length, message: 'Content generation started. Poll GET /content for status.' });
        setImmediate(async () => {
            for (const [locale, localeBriefs] of byLocale) {
                try {
                    const results = await (0, content_engine_1.generateBatch)(localeBriefs, defaultProfile, locale);
                    const updateTx = db.transaction(() => {
                        for (const result of results) {
                            const brief = localeBriefs.find((b) => b.id === result.brief_id);
                            if (!brief)
                                continue;
                            const updatedAt = new Date().toISOString();
                            if (result.success) {
                                const pageRow = db.prepare('SELECT * FROM generated_pages WHERE brief_id = ?').get(brief.id);
                                const pagePlaceholder = {
                                    id: pageRow?.['id'] ?? (0, uuid_1.v4)(),
                                    brief_id: brief.id,
                                    project_id: projectId,
                                    locale: brief.locale,
                                    slug: brief.slug,
                                    page_type: brief.page_type,
                                    h1: brief.h1,
                                    meta_title: brief.meta_title,
                                    meta_description: brief.meta_description,
                                    content_html: result.content_html,
                                    schema_json: [],
                                    internal_links: brief.internal_links,
                                    status: 'done',
                                    created_at: pageRow?.['created_at'] ?? updatedAt,
                                    updated_at: updatedAt,
                                };
                                const schema = (0, schema_engine_1.generateSchema)({ ...pagePlaceholder, content_html: result.content_html }, defaultProfile, brief.locale);
                                db.prepare(`UPDATE generated_pages SET content_html = ?, schema_json = ?, h1 = ?, meta_title = ?, meta_description = ?, internal_links = ?, status = 'done', updated_at = ? WHERE brief_id = ?`)
                                    .run(result.content_html, JSON.stringify(schema), brief.h1 ?? null, brief.meta_title ?? null, brief.meta_description ?? null, JSON.stringify(brief.internal_links), updatedAt, brief.id);
                            }
                            else {
                                db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE brief_id = ?").run(updatedAt, brief.id);
                            }
                        }
                    });
                    updateTx();
                    logger_1.logger.info(`Content gen locale ${locale}: ${results.filter((r) => r.success).length}/${results.length} succeeded`);
                }
                catch (err) {
                    logger_1.logger.error(`Content generation error for locale ${locale}`, { err });
                }
            }
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to queue content generation', { err });
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.contentRouter.get('/:pageId/preview', (req, res) => {
    try {
        const db = (0, client_1.getDb)();
        const pageRow = db.prepare('SELECT * FROM generated_pages WHERE id = ? AND project_id = ?').get(req.params.pageId, req.params.id);
        if (!pageRow) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }
        const page = parsePage(pageRow);
        if (!page.content_html) {
            res.status(400).json({ error: 'Page content not yet generated' });
            return;
        }
        const schemaScripts = (page.schema_json ?? [])
            .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
            .join('\n');
        const html = `<!DOCTYPE html>\n<html lang="${page.locale}">\n<head>\n<meta charset="UTF-8">\n<title>${page.meta_title ?? page.h1 ?? page.slug}</title>\n<meta name="description" content="${page.meta_description ?? ''}">\n<link rel="canonical" href="/${page.slug}">\n${schemaScripts}\n</head>\n<body>\n${page.content_html}\n</body>\n</html>`;
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
    catch (err) {
        logger_1.logger.error('Preview error', { err });
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.contentRouter.post('/:pageId/regenerate', async (req, res) => {
    try {
        const db = (0, client_1.getDb)();
        const pageRow = db.prepare('SELECT * FROM generated_pages WHERE id = ? AND project_id = ?').get(req.params.pageId, req.params.id);
        if (!pageRow) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }
        const page = parsePage(pageRow);
        const briefRow = db.prepare('SELECT * FROM page_briefs WHERE id = ?').get(page.brief_id);
        if (!briefRow) {
            res.status(404).json({ error: 'Brief not found' });
            return;
        }
        const brief = parseBrief(briefRow);
        const profileRow = db.prepare('SELECT * FROM business_profiles WHERE project_id = ?').get(req.params.id);
        const defaultProfile = profileRow
            ? parseProfile(profileRow)
            : { id: '', project_id: req.params.id, trust_points: [], brand_colors: {}, data: {} };
        db.prepare("UPDATE generated_pages SET status = 'generating', updated_at = ? WHERE id = ?").run(new Date().toISOString(), req.params.pageId);
        res.json({ message: 'Regeneration started', page_id: req.params.pageId });
        setImmediate(async () => {
            try {
                const results = await (0, content_engine_1.generateBatch)([brief], defaultProfile, brief.locale);
                const result = results[0];
                const updatedAt = new Date().toISOString();
                if (result && result.success) {
                    const schema = (0, schema_engine_1.generateSchema)({ ...page, content_html: result.content_html }, defaultProfile, brief.locale);
                    db.prepare(`UPDATE generated_pages SET content_html = ?, schema_json = ?, status = 'done', updated_at = ? WHERE id = ?`)
                        .run(result.content_html, JSON.stringify(schema), updatedAt, req.params.pageId);
                }
                else {
                    db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE id = ?").run(updatedAt, req.params.pageId);
                }
            }
            catch (err) {
                logger_1.logger.error('Regeneration background error', { err });
                db.prepare("UPDATE generated_pages SET status = 'failed', updated_at = ? WHERE id = ?").run(new Date().toISOString(), req.params.pageId);
            }
        });
    }
    catch (err) {
        logger_1.logger.error('Regeneration error', { err });
        res.status(500).json({ error: 'Internal server error' });
    }
});
function parsePage(row) {
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
        schema_json: tryParse(row['schema_json'], []),
        internal_links: tryParse(row['internal_links'], []),
        status: row['status'],
        wp_page_id: row['wp_page_id'],
        created_at: row['created_at'],
        updated_at: row['updated_at'],
    };
}
function parseBrief(row) {
    return {
        id: row['id'],
        plan_id: row['plan_id'],
        project_id: row['project_id'],
        page_type: row['page_type'],
        locale: row['locale'],
        slug: row['slug'],
        primary_keyword: row['primary_keyword'],
        secondary_keywords: tryParse(row['secondary_keywords'], []),
        h1: row['h1'],
        meta_title: row['meta_title'],
        meta_description: row['meta_description'],
        section_structure: tryParse(row['section_structure'], []),
        cta_angle: row['cta_angle'],
        faq_questions: tryParse(row['faq_questions'], []),
        internal_links: tryParse(row['internal_links'], []),
        schema_types: tryParse(row['schema_types'], []),
        status: row['status'],
        created_at: row['created_at'],
    };
}
function parseProfile(row) {
    return {
        id: row['id'],
        project_id: row['project_id'],
        business_name: row['business_name'],
        description: row['description'],
        phone: row['phone'],
        email: row['email'],
        booking_url: row['booking_url'],
        years_in_business: row['years_in_business'],
        trust_points: tryParse(row['trust_points'], []),
        brand_colors: tryParse(row['brand_colors'], {}),
        logo_url: row['logo_url'],
        tone: row['tone'],
        target_customer: row['target_customer'],
        data: tryParse(row['data'], {}),
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
//# sourceMappingURL=content.js.map