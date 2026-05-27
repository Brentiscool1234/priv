import type { QAReport } from '../types';
/**
 * Run QA checks for all generated pages in a project.
 * Playwright-based live crawling is stubbed — checks run on stored page data.
 */
export declare function runQAForProject(projectId: string, deploymentId?: string): Promise<QAReport>;
//# sourceMappingURL=crawler.d.ts.map