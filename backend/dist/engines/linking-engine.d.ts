import type { PagePlan, InternalLink } from '../types';
/**
 * Compute internal links for a given page plan given all plans in the project.
 * Anchor text is localized per locale.
 */
export declare function computeInternalLinks(page: PagePlan, allPages: PagePlan[], locale: string): InternalLink[];
//# sourceMappingURL=linking-engine.d.ts.map