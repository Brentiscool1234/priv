import type { PageType } from '../types';
export interface PageTemplate {
    sections: string[];
    schema_types: string[];
    faq_count: number;
}
export declare const PAGE_TEMPLATES: Record<PageType, PageTemplate>;
export declare function getTemplate(pageType: PageType): PageTemplate;
//# sourceMappingURL=templates.d.ts.map