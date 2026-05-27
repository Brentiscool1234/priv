"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocaleConfig = exports.BELGIAN_CITIES = exports.LOCALES = void 0;
exports.getLocalizedCityName = getLocalizedCityName;
exports.slugify = slugify;
exports.buildServiceLocationSlug = buildServiceLocationSlug;
exports.buildServiceSlug = buildServiceSlug;
exports.buildLocationSlug = buildLocationSlug;
exports.getLocaleSlugPrefix = getLocaleSlugPrefix;
exports.translatePageName = translatePageName;
const locales_1 = require("../lib/locales");
Object.defineProperty(exports, "LOCALES", { enumerable: true, get: function () { return locales_1.LOCALES; } });
Object.defineProperty(exports, "getLocaleConfig", { enumerable: true, get: function () { return locales_1.getLocaleConfig; } });
// Belgian city name mappings: city name per locale
exports.BELGIAN_CITIES = {
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
const DIACRITIC_MAP = {
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
function getLocalizedCityName(city, locale) {
    const key = city.toLowerCase().trim();
    if (exports.BELGIAN_CITIES[key] && exports.BELGIAN_CITIES[key][locale]) {
        return exports.BELGIAN_CITIES[key][locale];
    }
    return city;
}
/**
 * Generate a URL-safe slug from text, applying locale-appropriate diacritic handling.
 */
function slugify(text, locale) {
    const cfg = (0, locales_1.getLocaleConfig)(locale);
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
 * Build a locale-aware slug for a service+location page.
 */
function buildServiceLocationSlug(serviceName, cityName, locale) {
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
function buildServiceSlug(serviceName, locale) {
    const localeSlug = getLocaleSlugPrefix(locale);
    const svcSlug = slugify(serviceName, locale);
    return localeSlug ? `${localeSlug}/${svcSlug}` : svcSlug;
}
/**
 * Build a locale-aware slug for a location hub page.
 */
function buildLocationSlug(cityName, locale) {
    const localeSlug = getLocaleSlugPrefix(locale);
    const citySlug = slugify(cityName, locale);
    // "area" labels per language
    const areaLabel = {
        en: 'area',
        nl: 'regio',
        fr: 'region',
        de: 'gebiet',
    };
    const cfg = (0, locales_1.getLocaleConfig)(locale);
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
function getLocaleSlugPrefix(locale, primaryLocale) {
    if (primaryLocale && locale === primaryLocale)
        return '';
    // Only add prefix for non-default locales to avoid collision
    const cfg = (0, locales_1.getLocaleConfig)(locale);
    // Use language-country code as prefix, e.g. 'nl', 'fr', 'de'
    return cfg.language;
}
/**
 * Translate common page names per locale.
 */
function translatePageName(page, locale) {
    const translations = {
        home: { en: 'home', nl: 'home', fr: 'accueil', de: 'startseite' },
        about: { en: 'about', nl: 'over-ons', fr: 'a-propos', de: 'uber-uns' },
        contact: { en: 'contact', nl: 'contact', fr: 'contact', de: 'kontakt' },
        faq: { en: 'faq', nl: 'veelgestelde-vragen', fr: 'foire-aux-questions', de: 'haufige-fragen' },
        services: { en: 'services', nl: 'diensten', fr: 'services', de: 'dienstleistungen' },
        areas: { en: 'areas', nl: 'regio', fr: 'regions', de: 'gebiete' },
    };
    const cfg = (0, locales_1.getLocaleConfig)(locale);
    return translations[page]?.[cfg.language] ?? page;
}
//# sourceMappingURL=locale-engine.js.map