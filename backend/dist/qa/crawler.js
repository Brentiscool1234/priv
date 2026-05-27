"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQAForProject = runQAForProject;
const uuid_1 = require("uuid");
const checks_1 = require("./checks");
const client_1 = require("../db/client");
const logger_1 = require("../lib/logger");
/**
 * Run QA checks for all generated pages in a project.
 * Playwright-based live crawling is stubbed — checks run on stored page data.
 */
async function runQAForProject(projectId, deploymentId) {
    const db = (0, client_1.getDb)();
    const reportId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    // Create pending report
    const report = {
        id: reportId,
        project_id: projectId,
        deployment_id: deploymentId,
        pass_count: 0,
        warning_count: 0,
        fail_count: 0,
        total_pages: 0,
        status: 'running',
        created_at: now,
    };
    db.prepare(`INSERT INTO qa_reports (id, project_id, deployment_id, pass_count, warning_count, fail_count, total_pages, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(report.id, report.project_id, report.deployment_id ?? null, report.pass_count, report.warning_count, report.fail_count, report.total_pages, report.status, report.created_at);
    logger_1.logger.info(`QA report ${reportId} started for project ${projectId}`);
    // ── Fetch all generated pages for project ──────────────────────────────────
    const rows = db
        .prepare(`SELECT * FROM generated_pages WHERE project_id = ?`)
        .all(projectId);
    const pages = rows.map(deserializePage);
    // ── Fetch sitemap slugs ────────────────────────────────────────────────────
    const sitemapRows = db
        .prepare(`SELECT slug FROM page_plans WHERE project_id = ?`)
        .all(projectId);
    const sitemapSlugs = new Set(sitemapRows.map((r) => r.slug));
    report.total_pages = pages.length;
    // ── Run checks for each page ───────────────────────────────────────────────
    const allIssues = [];
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;
    for (const page of pages) {
        logger_1.logger.debug(`Running QA checks for page ${page.slug}`);
        const results = (0, checks_1.runQAChecks)(page, Array.from(sitemapSlugs), pages);
        for (const r of results) {
            if (r.status === 'pass')
                passCount++;
            else if (r.status === 'warn')
                warnCount++;
            else
                failCount++;
            allIssues.push({
                id: (0, uuid_1.v4)(),
                report_id: reportId,
                project_id: projectId,
                page_slug: page.slug,
                check_name: r.check_name,
                status: r.status,
                message: r.message,
                created_at: new Date().toISOString(),
            });
        }
    }
    // ── Persist QA issues in bulk ──────────────────────────────────────────────
    const insertIssue = db.prepare(`INSERT INTO qa_issues (id, report_id, project_id, page_slug, check_name, status, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertMany = db.transaction((issues) => {
        for (const issue of issues) {
            insertIssue.run(issue.id, issue.report_id, issue.project_id, issue.page_slug ?? null, issue.check_name, issue.status, issue.message ?? null, issue.created_at);
        }
    });
    insertMany(allIssues);
    // ── Finalize report ────────────────────────────────────────────────────────
    report.pass_count = passCount;
    report.warning_count = warnCount;
    report.fail_count = failCount;
    report.total_pages = pages.length;
    report.status = 'done';
    db.prepare(`UPDATE qa_reports SET pass_count = ?, warning_count = ?, fail_count = ?, total_pages = ?, status = ? WHERE id = ?`).run(report.pass_count, report.warning_count, report.fail_count, report.total_pages, report.status, report.id);
    logger_1.logger.info(`QA report ${reportId} done: ${passCount} pass, ${warnCount} warn, ${failCount} fail`);
    return report;
}
// ─── Serialization ────────────────────────────────────────────────────────────
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
//# sourceMappingURL=crawler.js.map