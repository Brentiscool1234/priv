"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSitemap = generateSitemap;
const uuid_1 = require("uuid");
const locale_engine_1 = require("./locale-engine");
const locales_1 = require("../lib/locales");
const MAX_PAGES = 200;
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
function generateSitemap(project, services, locations, opts = {}) {
    const limit = Math.min(opts.max_pages ?? MAX_PAGES, MAX_PAGES);
    const allLocales = [project.primary_locale, ...(project.secondary_locales ?? [])].filter((l, i, arr) => arr.indexOf(l) === i);
    const activeLocales = opts.include_locales
        ? allLocales.filter((l) => opts.include_locales.includes(l))
        : allLocales;
    const plans = [];
    const usedSlugs = new Set();
    const now = new Date().toISOString();
    function addPlan(pageType, locale, slug, priority, serviceId, locationId) {
        if (plans.length >= limit)
            return false;
        if (usedSlugs.has(slug))
            return false;
        usedSlugs.add(slug);
        plans.push({
            id: (0, uuid_1.v4)(),
            project_id: project.id,
            page_type: pageType,
            locale,
            service_id: serviceId,
            location_id: locationId,
            slug,
            status: 'proposed',
            priority,
            created_at: now,
        });
        return true;
    }
    // ── Static pages per locale ─────────────────────────────────────────────────
    for (const locale of activeLocales) {
        const prefix = getLocalePrefix(locale, project.primary_locale);
        // Homepage
        const homeSlug = prefix ? `${prefix}` : '';
        addPlan('homepage', locale, homeSlug || 'home', 10, undefined, undefined);
        // About
        const aboutName = (0, locale_engine_1.translatePageName)('about', locale);
        addPlan('about', locale, prefix ? `${prefix}/${aboutName}` : aboutName, 5);
        // Contact
        const contactName = (0, locale_engine_1.translatePageName)('contact', locale);
        addPlan('contact', locale, prefix ? `${prefix}/${contactName}` : contactName, 8);
        // FAQ
        const faqName = (0, locale_engine_1.translatePageName)('faq', locale);
        addPlan('faq', locale, prefix ? `${prefix}/${faqName}` : faqName, 3);
    }
    // ── Service pages ────────────────────────────────────────────────────────────
    for (const locale of activeLocales) {
        const prefix = getLocalePrefix(locale, project.primary_locale);
        const servicesLabel = (0, locale_engine_1.translatePageName)('services', locale);
        for (const svc of services) {
            if (plans.length >= limit)
                break;
            const svcSlug = svc.slug
                ? (0, locale_engine_1.slugify)(svc.slug, locale)
                : (0, locale_engine_1.slugify)(svc.name, locale);
            const fullSlug = prefix
                ? `${prefix}/${servicesLabel}/${svcSlug}`
                : `${servicesLabel}/${svcSlug}`;
            addPlan('service', locale, fullSlug, 7, svc.id);
        }
    }
    // ── Location hub pages (priority >= 2) ──────────────────────────────────────
    const hubLocations = locations.filter((l) => l.priority >= 2 && l.included);
    for (const locale of activeLocales) {
        const prefix = getLocalePrefix(locale, project.primary_locale);
        const areasLabel = (0, locale_engine_1.translatePageName)('areas', locale);
        for (const loc of hubLocations) {
            if (plans.length >= limit)
                break;
            const cityName = (0, locale_engine_1.getLocalizedCityName)(loc.city, locale);
            const citySlug = (0, locale_engine_1.slugify)(cityName, locale);
            const fullSlug = prefix
                ? `${prefix}/${areasLabel}/${citySlug}`
                : `${areasLabel}/${citySlug}`;
            addPlan('location', locale, fullSlug, 6, undefined, loc.id);
        }
    }
    // ── Service × Location pages ─────────────────────────────────────────────────
    const comboLocations = locations.filter((l) => l.priority >= 2 && l.included);
    for (const locale of activeLocales) {
        const prefix = getLocalePrefix(locale, project.primary_locale);
        const servicesLabel = (0, locale_engine_1.translatePageName)('services', locale);
        for (const svc of services) {
            for (const loc of comboLocations) {
                if (plans.length >= limit)
                    break;
                const cityName = (0, locale_engine_1.getLocalizedCityName)(loc.city, locale);
                const svcSlug = svc.slug
                    ? (0, locale_engine_1.slugify)(svc.slug, locale)
                    : (0, locale_engine_1.slugify)(svc.name, locale);
                const citySlug = (0, locale_engine_1.slugify)(cityName, locale);
                const fullSlug = prefix
                    ? `${prefix}/${servicesLabel}/${svcSlug}/${citySlug}`
                    : `${servicesLabel}/${svcSlug}/${citySlug}`;
                addPlan('service_location', locale, fullSlug, 4, svc.id, loc.id);
            }
            if (plans.length >= limit)
                break;
        }
        if (plans.length >= limit)
            break;
    }
    return plans;
}
/**
 * Returns a locale URL prefix for secondary locales (e.g. "nl", "fr", "de").
 * Primary locale returns empty string.
 */
function getLocalePrefix(locale, primaryLocale) {
    if (locale === primaryLocale)
        return '';
    const cfg = (0, locales_1.getLocaleConfig)(locale);
    return cfg.language;
}
//# sourceMappingURL=sitemap-engine.js.map