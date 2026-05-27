import { v4 as uuidv4 } from 'uuid';
import { runQAChecks } from './checks';
import { getDb, runTransaction } from '../db/client';
import { logger } from '../lib/logger';
import type { GeneratedPage, QAReport, QAIssue } from '../types';

/**
 * Run QA checks for all generated pages in a project.
 * Playwright-based live crawling is stubbed — checks run on stored page data.
 */
export async function runQAForProject(
  projectId: string,
  deploymentId?: string
): Promise<QAReport> {
  const db = getDb();
  const reportId = uuidv4();
  const now = new Date().toISOString();

  // Create pending report
  const report: QAReport = {
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

  db.prepare(
    `INSERT INTO qa_reports (id, project_id, deployment_id, pass_count, warning_count, fail_count, total_pages, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    report.id,
    report.project_id,
    report.deployment_id ?? null,
    report.pass_count,
    report.warning_count,
    report.fail_count,
    report.total_pages,
    report.status,
    report.created_at
  );

  logger.info(`QA report ${reportId} started for project ${projectId}`);

  // ── Fetch all generated pages for project ──────────────────────────────────
  const rows = db
    .prepare(`SELECT * FROM generated_pages WHERE project_id = ?`)
    .all(projectId) as Record<string, unknown>[];

  const pages: GeneratedPage[] = rows.map(deserializePage);

  // ── Fetch sitemap slugs ────────────────────────────────────────────────────
  const sitemapRows = db
    .prepare(`SELECT slug FROM page_plans WHERE project_id = ?`)
    .all(projectId) as { slug: string }[];
  const sitemapSlugs = new Set(sitemapRows.map((r) => r.slug));

  report.total_pages = pages.length;

  // ── Run checks for each page ───────────────────────────────────────────────
  const allIssues: QAIssue[] = [];
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const page of pages) {
    logger.debug(`Running QA checks for page ${page.slug}`);

    const results = runQAChecks(page, Array.from(sitemapSlugs), pages);

    for (const r of results) {
      if (r.status === 'pass') passCount++;
      else if (r.status === 'warn') warnCount++;
      else failCount++;
      allIssues.push({
        id: uuidv4(),
        report_id: reportId,
        project_id: projectId,
        page_slug: page.slug,
        check_name: r.check_name,
        status: r.status as 'pass' | 'warn' | 'fail',
        message: r.message,
        created_at: new Date().toISOString(),
      });
    }
  }

  // ── Persist QA issues in bulk ──────────────────────────────────────────────
  const insertIssue = db.prepare(
    `INSERT INTO qa_issues (id, report_id, project_id, page_slug, check_name, status, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  runTransaction(db, () => {
    for (const issue of allIssues) {
      insertIssue.run(
        issue.id,
        issue.report_id,
        issue.project_id,
        issue.page_slug ?? null,
        issue.check_name,
        issue.status,
        issue.message ?? null,
        issue.created_at
      );
    }
  });

  // ── Finalize report ────────────────────────────────────────────────────────
  report.pass_count = passCount;
  report.warning_count = warnCount;
  report.fail_count = failCount;
  report.total_pages = pages.length;
  report.status = 'done';

  db.prepare(
    `UPDATE qa_reports SET pass_count = ?, warning_count = ?, fail_count = ?, total_pages = ?, status = ? WHERE id = ?`
  ).run(
    report.pass_count,
    report.warning_count,
    report.fail_count,
    report.total_pages,
    report.status,
    report.id
  );

  logger.info(
    `QA report ${reportId} done: ${passCount} pass, ${warnCount} warn, ${failCount} fail`
  );

  return report;
}

// ─── Serialization ────────────────────────────────────────────────────────────

function deserializePage(row: Record<string, unknown>): GeneratedPage {
  return {
    id: row['id'] as string,
    brief_id: row['brief_id'] as string,
    project_id: row['project_id'] as string,
    locale: row['locale'] as string,
    slug: row['slug'] as string,
    page_type: row['page_type'] as GeneratedPage['page_type'],
    h1: row['h1'] as string | undefined,
    meta_title: row['meta_title'] as string | undefined,
    meta_description: row['meta_description'] as string | undefined,
    content_html: row['content_html'] as string | undefined,
    schema_json: row['schema_json'] ? JSON.parse(row['schema_json'] as string) : undefined,
    internal_links: row['internal_links'] ? JSON.parse(row['internal_links'] as string) : [],
    status: row['status'] as GeneratedPage['status'],
    wp_page_id: row['wp_page_id'] as number | undefined,
    created_at: row['created_at'] as string,
    updated_at: row['updated_at'] as string,
  };
}
