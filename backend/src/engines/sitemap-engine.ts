import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  Service,
  Location,
  PagePlan,
  PageType,
} from '../types';
import {
  slugify,
  getLocalizedCityName,
  translatePageName,
  getLocaleSlugPrefix,
} from './locale-engine';
import { getLocaleConfig } from '../lib/locales';

const MAX_PAGES = 200;

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
export function generateSitemap(
  project: Project,
  services: Service[],
  locations: Location[],
  opts: SitemapOptions = {}
): PagePlan[] {
  const limit = Math.min(opts.max_pages ?? MAX_PAGES, MAX_PAGES);
  const allLocales = [project.primary_locale, ...(project.secondary_locales ?? [])].filter(
    (l, i, arr) => arr.indexOf(l) === i
  );
  const activeLocales = opts.include_locales
    ? allLocales.filter((l) => opts.include_locales!.includes(l))
    : allLocales;

  const plans: PagePlan[] = [];
  const usedSlugs = new Set<string>();
  const now = new Date().toISOString();

  function addPlan(
    pageType: PageType,
    locale: string,
    slug: string,
    priority: number,
    serviceId?: string,
    locationId?: string
  ): boolean {
    if (plans.length >= limit) return false;
    if (usedSlugs.has(slug)) return false;
    usedSlugs.add(slug);
    plans.push({
      id: uuidv4(),
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
    const aboutName = translatePageName('about', locale);
    addPlan('about', locale, prefix ? `${prefix}/${aboutName}` : aboutName, 5);

    // Contact
    const contactName = translatePageName('contact', locale);
    addPlan('contact', locale, prefix ? `${prefix}/${contactName}` : contactName, 8);

    // FAQ
    const faqName = translatePageName('faq', locale);
    addPlan('faq', locale, prefix ? `${prefix}/${faqName}` : faqName, 3);
  }

  // ── Service pages ────────────────────────────────────────────────────────────
  for (const locale of activeLocales) {
    const prefix = getLocalePrefix(locale, project.primary_locale);
    const servicesLabel = translatePageName('services', locale);

    for (const svc of services) {
      if (plans.length >= limit) break;
      const svcSlug = svc.slug
        ? slugify(svc.slug, locale)
        : slugify(svc.name, locale);
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
    const areasLabel = translatePageName('areas', locale);

    for (const loc of hubLocations) {
      if (plans.length >= limit) break;
      const cityName = getLocalizedCityName(loc.city, locale);
      const citySlug = slugify(cityName, locale);
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
    const servicesLabel = translatePageName('services', locale);

    for (const svc of services) {
      for (const loc of comboLocations) {
        if (plans.length >= limit) break;
        const cityName = getLocalizedCityName(loc.city, locale);
        const svcSlug = svc.slug
          ? slugify(svc.slug, locale)
          : slugify(svc.name, locale);
        const citySlug = slugify(cityName, locale);
        const fullSlug = prefix
          ? `${prefix}/${servicesLabel}/${svcSlug}/${citySlug}`
          : `${servicesLabel}/${svcSlug}/${citySlug}`;

        addPlan('service_location', locale, fullSlug, 4, svc.id, loc.id);
      }
      if (plans.length >= limit) break;
    }
    if (plans.length >= limit) break;
  }

  return plans;
}

/**
 * Returns a locale URL prefix for secondary locales (e.g. "nl", "fr", "de").
 * Primary locale returns empty string.
 */
function getLocalePrefix(locale: string, primaryLocale: string): string {
  if (locale === primaryLocale) return '';
  const cfg = getLocaleConfig(locale);
  return cfg.language;
}
