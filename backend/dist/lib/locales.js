"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCALES = void 0;
exports.getLocaleConfig = getLocaleConfig;
exports.getSupportedLocales = getSupportedLocales;
exports.LOCALES = {
    'en-US': {
        code: 'en-US',
        name: 'English (US)',
        language: 'en',
        country: 'US',
        currency: 'USD',
        formality: 'informal',
        cta_style: 'Get a Free Quote',
        date_format: 'MM/DD/YYYY',
        phone_format: '+1 (xxx) xxx-xxxx',
    },
    'en-GB': {
        code: 'en-GB',
        name: 'English (UK)',
        language: 'en',
        country: 'GB',
        currency: 'GBP',
        formality: 'semi-formal',
        cta_style: 'Get a Free Quote',
        date_format: 'DD/MM/YYYY',
        phone_format: '+44 xxxx xxxxxx',
    },
    'nl-BE': {
        code: 'nl-BE',
        name: 'Dutch (Belgium/Flemish)',
        language: 'nl',
        country: 'BE',
        currency: 'EUR',
        formality: 'professional',
        cta_style: 'Vraag Offerte Aan',
        date_format: 'DD/MM/YYYY',
        phone_format: '+32 xxx xx xx xx',
    },
    'nl-NL': {
        code: 'nl-NL',
        name: 'Dutch (Netherlands)',
        language: 'nl',
        country: 'NL',
        currency: 'EUR',
        formality: 'direct',
        cta_style: 'Vraag Offerte Aan',
        date_format: 'DD-MM-YYYY',
        phone_format: '+31 xx xxx xxxx',
    },
    'fr-BE': {
        code: 'fr-BE',
        name: 'French (Belgium)',
        language: 'fr',
        country: 'BE',
        currency: 'EUR',
        formality: 'formal',
        cta_style: 'Demander un Devis',
        date_format: 'DD/MM/YYYY',
        phone_format: '+32 xxx xx xx xx',
    },
    'fr-FR': {
        code: 'fr-FR',
        name: 'French (France)',
        language: 'fr',
        country: 'FR',
        currency: 'EUR',
        formality: 'formal',
        cta_style: 'Demander un Devis',
        date_format: 'DD/MM/YYYY',
        phone_format: '+33 x xx xx xx xx',
    },
    'de-DE': {
        code: 'de-DE',
        name: 'German (Germany)',
        language: 'de',
        country: 'DE',
        currency: 'EUR',
        formality: 'formal',
        cta_style: 'Angebot Anfordern',
        date_format: 'DD.MM.YYYY',
        phone_format: '+49 xxx xxxxxxxx',
    },
    'de-BE': {
        code: 'de-BE',
        name: 'German (Belgium)',
        language: 'de',
        country: 'BE',
        currency: 'EUR',
        formality: 'formal',
        cta_style: 'Angebot Anfordern',
        date_format: 'DD.MM.YYYY',
        phone_format: '+32 xxx xx xx xx',
    },
};
function getLocaleConfig(locale) {
    return exports.LOCALES[locale] ?? exports.LOCALES['en-US'];
}
function getSupportedLocales() {
    return Object.keys(exports.LOCALES);
}
//# sourceMappingURL=locales.js.map