import { LOCALES, getLocaleConfig } from '../lib/locales';
export { LOCALES };
export declare const BELGIAN_CITIES: Record<string, Record<string, string>>;
/**
 * Returns the localized display name for a city.
 * Falls back to the raw city string if no mapping exists.
 */
export declare function getLocalizedCityName(city: string, locale: string): string;
/**
 * Generate a URL-safe slug from text, applying locale-appropriate diacritic handling.
 */
export declare function slugify(text: string, locale: string): string;
/**
 * Re-export getLocaleConfig from lib/locales for convenience.
 */
export { getLocaleConfig };
/**
 * Build a locale-aware slug for a service+location page.
 */
export declare function buildServiceLocationSlug(serviceName: string, cityName: string, locale: string): string;
/**
 * Build a locale-aware slug for a service page.
 */
export declare function buildServiceSlug(serviceName: string, locale: string): string;
/**
 * Build a locale-aware slug for a location hub page.
 */
export declare function buildLocationSlug(cityName: string, locale: string): string;
/**
 * Build a locale prefix for non-primary locales.
 * Primary locale (e.g. en-US) gets no prefix;
 * secondary locales get their language code.
 */
export declare function getLocaleSlugPrefix(locale: string, primaryLocale?: string): string;
/**
 * Translate common page names per locale.
 */
export declare function translatePageName(page: 'home' | 'about' | 'contact' | 'faq' | 'services' | 'areas', locale: string): string;
//# sourceMappingURL=locale-engine.d.ts.map