"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_TEMPLATES = void 0;
exports.getTemplate = getTemplate;
exports.PAGE_TEMPLATES = {
    homepage: {
        sections: [
            'hero',
            'trust_bar',
            'services_overview',
            'why_choose_us',
            'testimonials',
            'service_areas',
            'cta_banner',
            'faq_snippet',
        ],
        schema_types: ['WebSite', 'LocalBusiness', 'BreadcrumbList'],
        faq_count: 4,
    },
    about: {
        sections: [
            'about_hero',
            'our_story',
            'team_intro',
            'values',
            'trust_points',
            'cta_banner',
        ],
        schema_types: ['WebPage', 'Organization', 'BreadcrumbList'],
        faq_count: 3,
    },
    contact: {
        sections: [
            'contact_hero',
            'contact_form',
            'contact_info',
            'service_areas_map',
            'faq_snippet',
        ],
        schema_types: ['WebPage', 'LocalBusiness', 'BreadcrumbList'],
        faq_count: 3,
    },
    faq: {
        sections: ['faq_hero', 'faq_list', 'cta_banner'],
        schema_types: ['FAQPage', 'WebPage', 'BreadcrumbList'],
        faq_count: 10,
    },
    service: {
        sections: [
            'service_hero',
            'service_intro',
            'service_details',
            'benefits',
            'process_steps',
            'service_areas',
            'testimonials',
            'faq',
            'cta_banner',
        ],
        schema_types: ['Service', 'WebPage', 'BreadcrumbList'],
        faq_count: 5,
    },
    location: {
        sections: [
            'location_hero',
            'services_in_city',
            'about_area',
            'why_choose_us',
            'local_testimonials',
            'faq',
            'cta_banner',
        ],
        schema_types: ['LocalBusiness', 'WebPage', 'BreadcrumbList'],
        faq_count: 4,
    },
    service_location: {
        sections: [
            'hero',
            'service_intro',
            'local_context',
            'service_details',
            'benefits',
            'process_steps',
            'testimonials',
            'faq',
            'cta_banner',
        ],
        schema_types: ['Service', 'LocalBusiness', 'WebPage', 'BreadcrumbList'],
        faq_count: 6,
    },
};
function getTemplate(pageType) {
    return exports.PAGE_TEMPLATES[pageType] ?? exports.PAGE_TEMPLATES['service'];
}
//# sourceMappingURL=templates.js.map