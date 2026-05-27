import { LOCALES, getLocaleConfig } from '../lib/locales';
import type { LocaleConfig } from '../types';

export { LOCALES };

// Belgian city name mappings: city name per locale
export const BELGIAN_CITIES: Record<string, Record<string, string>> = {
  antwerp: {
    'nl-BE': 'Antwerpen',
    'fr-BE': 'Anvers',
    'en-US': 'Antwerp',
    'en-GB': 'Antwerp',
    'de-BE': 'Antwerpen',
  },
  brussels: {
    'nl-BE': 'Brussel',
    'fr-BE': 'Bruxelles',
    'en-US': 'Brussels',
    'en-GB': 'Brussels',
    'de-BE': 'Brüssel',
  },
  ghent: {
    'nl-BE': 'Gent',
    'fr-BE': 'Gand',
    'en-US': 'Ghent',
    'en-GB': 'Ghent',
    'de-BE': 'Gent',
  },
  bruges: {
    'nl-BE': 'Brugge',
    'fr-BE': 'Bruges',
    'en-US': 'Bruges',
    'en-GB': 'Bruges',
    'de-BE': 'Brügge',
  },
  liege: {
    'nl-BE': 'Luik',
    'fr-BE': 'Liège',
    'en-US': 'Liège',
    'en-GB': 'Liège',
    'de-BE': 'Lüttich',
  },
  mons: {
    'nl-BE': 'Bergen',
    'fr-BE': 'Mons',
    'en-US': 'Mons',
    'en-GB': 'Mons',
    'de-BE': 'Bergen',
  },
  namur: {
    'nl-BE': 'Namen',
    'fr-BE': 'Namur',
    'en-US': 'Namur',
    'en-GB': 'Namur',
    'de-BE': 'Namur',
  },
};

/**
 * Diacritic normalization maps per language family.
 * Maps accented chars → ASCII equivalents for slug generation.
 */
const DIACRITIC_MAP: Record<string, Record<string, string>> = {
  fr: {
    à: 'a', â: 'a', ä: 'a', á: 'a', ã: 'a',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    î: 'i', ï: 'i', í: 'i', ì: 'i',
    ô: 'o', ö: 'o', ó: 'o', ò: 'o', õ: 'o',
    û: 'u', ü: 'u', ú: 'u', ù: 'u',
    ç: 'c', ñ: 'n', œ: 'oe', æ: 'ae',
  },
  nl: {
    à: 'a', á: 'a', â: 'a', ä: 'a',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    î: 'i', ï: 'i',
    ô: 'o', ö: 'o', ó: 'o',
    û: 'u', ü: 'u',
    ç: 'c', ij: 'ij',
  },
  de: {
    ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
    à: 'a', á: 'a', â: 'a',
    è: 'e', é: 'e', ê: 'e',
    î: 'i', ï: 'i',
    ô: 'o',
    û: 'u',
  },
  en: {
    à: 'a', á: 'a', â: 'a', ä: 'a', ã: 'a',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    î: 'i', ï: 'i',
    ô: 'o', ö: 'o',
    û: 'u', ü: 'u',
    ç: 'c', ñ: 'n',
  },
};

/**
 * Returns the localized display name for a city.
 * Falls back to the raw city string if no mapping exists.
 */
export function getLocalizedCityName(city: string, locale: string): string {
  const key = city.toLowerCase().trim();
  if (BELGIAN_CITIES[key] && BELGIAN_CITIES[key][locale]) {
    return BELGIAN_CITIES[key][locale];
  }
  return city;
}

/**
 * Generate a URL-safe slug from text, applying locale-appropriate diacritic handling.
 */
export function slugify(text: string, locale: string): string {
  const cfg = getLocaleConfig(locale);
  const lang = cfg.language;
  const map = DIACRITIC_MAP[lang] ?? DIACRITIC_MAP['en'];

  let result = text.toLowerCase().trim();

  // Apply diacritic map (longer keys first to handle digraphs like 'ij', 'oe')
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    result = result.split(k).join(map[k]);
  }

  // Replace non-alphanumeric (except hyphens) with hyphens
  result = result.replace(/[^a-z0-9]+/g, '-');

  // Collapse multiple hyphens
  result = result.replace(/-{2,}/g, '-');

  // Trim leading/trailing hyphens
  result = result.replace(/^-+|-+$/g, '');

  return result;
}

/**
 * Re-export getLocaleConfig from lib/locales for convenience.
 */
export { getLocaleConfig };

/**
 * Build a locale-aware slug for a service+location page.
 */
export function buildServiceLocationSlug(
  serviceName: string,
  cityName: string,
  locale: string
): string {
  const localeSlug = getLocaleSlugPrefix(locale);
  const svcSlug = slugify(serviceName, locale);
  const citySlug = slugify(cityName, locale);

  if (localeSlug) {
    return `${localeSlug}/${svcSlug}/${citySlug}`;
  }
  return `${svcSlug}/${citySlug}`;
}

/**
 * Build a locale-aware slug for a service page.
 */
export function buildServiceSlug(serviceName: string, locale: string): string {
  const localeSlug = getLocaleSlugPrefix(locale);
  const svcSlug = slugify(serviceName, locale);
  return localeSlug ? `${localeSlug}/${svcSlug}` : svcSlug;
}

/**
 * Build a locale-aware slug for a location hub page.
 */
export function buildLocationSlug(cityName: string, locale: string): string {
  const localeSlug = getLocaleSlugPrefix(locale);
  const citySlug = slugify(cityName, locale);

  // "area" labels per language
  const areaLabel: Record<string, string> = {
    en: 'area',
    nl: 'regio',
    fr: 'region',
    de: 'gebiet',
  };
  const cfg = getLocaleConfig(locale);
  const label = areaLabel[cfg.language] ?? 'area';

  return localeSlug
    ? `${localeSlug}/${label}/${citySlug}`
    : `${label}/${citySlug}`;
}

/**
 * Build a locale prefix for non-primary locales.
 * Primary locale (e.g. en-US) gets no prefix;
 * secondary locales get their language code.
 */
export function getLocaleSlugPrefix(
  locale: string,
  primaryLocale?: string
): string {
  if (primaryLocale && locale === primaryLocale) return '';
  // Only add prefix for non-default locales to avoid collision
  const cfg = getLocaleConfig(locale);
  // Use language-country code as prefix, e.g. 'nl', 'fr', 'de'
  return cfg.language;
}

/**
 * Translate common page names per locale.
 */
export function translatePageName(
  page: 'home' | 'about' | 'contact' | 'faq' | 'services' | 'areas',
  locale: string
): string {
  const translations: Record<string, Record<string, string>> = {
    home: { en: 'home', nl: 'home', fr: 'accueil', de: 'startseite' },
    about: { en: 'about', nl: 'over-ons', fr: 'a-propos', de: 'uber-uns' },
    contact: { en: 'contact', nl: 'contact', fr: 'contact', de: 'kontakt' },
    faq: { en: 'faq', nl: 'veelgestelde-vragen', fr: 'foire-aux-questions', de: 'haufige-fragen' },
    services: { en: 'services', nl: 'diensten', fr: 'services', de: 'dienstleistungen' },
    areas: { en: 'areas', nl: 'regio', fr: 'regions', de: 'gebiete' },
  };
  const cfg = getLocaleConfig(locale);
  return translations[page]?.[cfg.language] ?? page;
}
