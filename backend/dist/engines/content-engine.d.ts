import type { PageBrief, BusinessProfile, LocaleConfig } from '../types';
export interface ContentResult {
    brief_id: string;
    content_html: string;
    success: boolean;
    error?: string;
}
/**
 * Generate HTML content for a single page brief using OpenAI.
 */
export declare function generatePageContent(brief: PageBrief, businessProfile: BusinessProfile, locale: LocaleConfig): Promise<string>;
/**
 * Generate content for multiple briefs with rate limiting (max 5 concurrent).
 */
export declare function generateBatch(briefs: PageBrief[], businessProfile: BusinessProfile, localeCode: string): Promise<ContentResult[]>;
//# sourceMappingURL=content-engine.d.ts.map