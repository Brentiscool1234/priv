import type { Project, Service, Location, PagePlan } from '../types';
export interface SitemapOptions {
    max_pages?: number;
    include_locales?: string[];
}
/**
 * Build the full site map for a project.
 *
 * Always generates: homepage, about, faq, contact.
 * Per service: one service page.
 * Per location (priority >= 2): one location hub page.
 * Per service × location (priority >= 2): one service+location page.
 * All constrained to max_pages (default 200).
 * Multilingual: all page types replicated per secondary locale.
 */
export declare function generateSitemap(project: Project, services: Service[], locations: Location[], opts?: SitemapOptions): PagePlan[];
//# sourceMappingURL=sitemap-engine.d.ts.map