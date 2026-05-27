"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qaRouter = void 0;
const express_1 = require("express");
const client_1 = require("../db/client");
const checks_1 = require("../qa/checks");
const uuid_1 = require("uuid");
exports.qaRouter = (0, express_1.Router)({ mergeParams: true });
exports.qaRouter.post('/run', async (req, res) => {
    const db = (0, client_1.getDb)();
    const projectId = req.params.id;
    const pages = db.prepare('SELECT * FROM generated_pages WHERE project_id = ?').all(projectId);
    if (pages.length === 0)
        return res.status(400).json({ error: 'No generated pages found for this project' });
    const reportId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    db.prepare(`
    INSERT INTO qa_reports (id, project_id, status, total_pages, created_at)
    VALUES (?, ?, 'running', ?, ?)
  `).run(reportId, projectId, pages.length, now);
    const issueStmt = db.prepare(`
    INSERT INTO qa_issues (id, report_id, project_id, page_slug, check_name, status, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    let pass = 0, warn = 0, fail = 0;
    const allSlugs = pages.map((p) => p.slug);
    const tx = db.transaction(() => {
        for (const page of pages) {
            const issues = (0, checks_1.runQAChecks)(page, allSlugs, pages);
            for (const issue of issues) {
                if (issue.status === 'pass')
                    pass++;
                else if (issue.status === 'warn')
                    warn++;
                else
                    fail++;
                issueStmt.run((0, uuid_1.v4)(), reportId, projectId, page.slug, issue.check_name, issue.status, issue.message ?? null, now);
            }
        }
    });
    tx();
    db.prepare('UPDATE qa_reports SET status = ?, pass_count = ?, warning_count = ?, fail_count = ? WHERE id = ?')
        .run('done', pass, warn, fail, reportId);
    res.json({ report_id: reportId, total_pages: pages.length, pass, warn, fail });
});
exports.qaRouter.get('/', (req, res) => {
    const db = (0, client_1.getDb)();
    const report = db.prepare('SELECT * FROM qa_reports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.id);
    if (!report)
        return res.status(404).json({ error: 'No QA report found' });
    const issues = db.prepare('SELECT * FROM qa_issues WHERE report_id = ? ORDER BY status ASC, page_slug ASC').all(report.report_id ?? report.id);
    res.json({ report, issues });
});
exports.qaRouter.get('/export', (req, res) => {
    const db = (0, client_1.getDb)();
    const report = db.prepare('SELECT * FROM qa_reports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.id);
    if (!report)
        return res.status(404).json({ error: 'No QA report found' });
    const issues = db.prepare('SELECT * FROM qa_issues WHERE report_id = ?').all(report.id);
    const project = db.prepare('SELECT business_name FROM projects WHERE id = ?').get(req.params.id);
    const exportData = {
        generated_at: new Date().toISOString(),
        project: project?.business_name ?? 'Unknown',
        report,
        issues,
        summary: {
            total: report.total_pages,
            pass: report.pass_count,
            warning: report.warning_count,
            fail: report.fail_count,
        },
    };
    res.setHeader('Content-Disposition', `attachment; filename="qa-report-${req.params.id}.json"`);
    res.json(exportData);
});
//# sourceMappingURL=qa.js.map