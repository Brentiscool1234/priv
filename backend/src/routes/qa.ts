import { Router } from 'express';
import { getDb } from '../db/client';
import { runQAChecks } from '../qa/checks';
import { v4 as uuidv4 } from 'uuid';

export const qaRouter = Router({ mergeParams: true });

qaRouter.post('/run', async (req, res) => {
  const db = getDb();
  const projectId = ( req.params as any).id;

  const pages = db.prepare('SELECT * FROM generated_pages WHERE project_id = ?').all(projectId) as any[];
  if (pages.length === 0) return res.status(400).json({ error: 'No generated pages found for this project' });

  const reportId = uuidv4();
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
  const allSlugs = pages.map((p: any) => p.slug);

  const tx = db.transaction(() => {
    for (const page of pages) {
      const issues = runQAChecks(page, allSlugs, pages);
      for (const issue of issues) {
        if (issue.status === 'pass') pass++;
        else if (issue.status === 'warn') warn++;
        else fail++;
        issueStmt.run(uuidv4(), reportId, projectId, page.slug, issue.check_name, issue.status, issue.message ?? null, now);
      }
    }
  });
  tx();

  db.prepare('UPDATE qa_reports SET status = ?, pass_count = ?, warning_count = ?, fail_count = ? WHERE id = ?')
    .run('done', pass, warn, fail, reportId);

  res.json({ report_id: reportId, total_pages: pages.length, pass, warn, fail });
});

qaRouter.get('/', (req, res) => {
  const db = getDb();
  const report = db.prepare('SELECT * FROM qa_reports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(( req.params as any).id);
  if (!report) return res.status(404).json({ error: 'No QA report found' });
  const issues = db.prepare('SELECT * FROM qa_issues WHERE report_id = ? ORDER BY status ASC, page_slug ASC').all((report as any).report_id ?? (report as any).id);
  res.json({ report, issues });
});

qaRouter.get('/export', (req, res) => {
  const db = getDb();
  const report = db.prepare('SELECT * FROM qa_reports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(( req.params as any).id);
  if (!report) return res.status(404).json({ error: 'No QA report found' });
  const issues = db.prepare('SELECT * FROM qa_issues WHERE report_id = ?').all((report as any).id);
  const project = db.prepare('SELECT business_name FROM projects WHERE id = ?').get(( req.params as any).id) as { business_name: string } | undefined;

  const exportData = {
    generated_at: new Date().toISOString(),
    project: project?.business_name ?? 'Unknown',
    report,
    issues,
    summary: {
      total: (report as any).total_pages,
      pass: (report as any).pass_count,
      warning: (report as any).warning_count,
      fail: (report as any).fail_count,
    },
  };

  res.setHeader('Content-Disposition', `attachment; filename="qa-report-${( req.params as any).id}.json"`);
  res.json(exportData);
});
