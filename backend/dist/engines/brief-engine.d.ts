import type { PagePlan, PageBrief, BusinessProfile, Service, Location } from '../types';
export interface BriefContext {
    plan: PagePlan;
    businessProfile: BusinessProfile;
    service?: Service;
    location?: Location;
    allPlans: PagePlan[];
}
/**
 * Generate a PageBrief from a PagePlan + context data.
 * Does NOT call OpenAI — builds the brief from structured data.
 */
export declare function generateBrief(ctx: BriefContext): PageBrief;
//# sourceMappingURL=brief-engine.d.ts.map