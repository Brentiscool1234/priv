"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeInternalLinks = computeInternalLinks;
const locales_1 = require("../lib/locales");
/**
 * Compute internal links for a given page plan given all plans in the project.
 * Anchor text is localized per locale.
 */
function computeInternalLinks(page, allPages, locale) {
    const sameLocale = allPages.filter((p) => p.locale === locale);
    const links = [];
    const seen = new Set();
    function addLink(slug, anchor, pageType) {
        if (slug !== page.slug && !seen.has(slug)) {
            seen.add(slug);
            links.push({ slug, anchor_text: anchor, page_type: pageType });
        }
    }
    const lang = (0, locales_1.getLocaleConfig)(locale).language;
    // Common links: homepage + contact
    const homepage = sameLocale.find((p) => p.page_type === 'homepage');
    const contact = sameLocale.find((p) => p.page_type === 'contact');
    if (homepage)
        addLink(homepage.slug, homeLabel(lang), 'homepage');
    if (contact)
        addLink(contact.slug, contactLabel(lang), 'contact');
    switch (page.page_type) {
        case 'service': {
            // Top 3-5 location pages for this service
            const serviceLocPages = sameLocale
                .filter((p) => p.page_type === 'service_location' &&
                p.service_id === page.service_id)
                .slice(0, 5);
            for (const p of serviceLocPages) {
                const cityPart = p.slug.split('/').pop() ?? p.slug;
                addLink(p.slug, localServiceAnchor(cityPart, lang), 'service_location');
            }
            break;
        }
        case 'location': {
            // All services in this city
            const cityServices = sameLocale.filter((p) => p.page_type === 'service_location' &&
                p.location_id === page.location_id);
            for (const p of cityServices.slice(0, 8)) {
                const svcPart = p.slug.split('/').slice(-2, -1)[0] ?? p.slug;
                addLink(p.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service_location');
            }
            break;
        }
        case 'service_location': {
            // Parent service page
            const parentSvc = sameLocale.find((p) => p.page_type === 'service' && p.service_id === page.service_id);
            if (parentSvc) {
                const svcPart = parentSvc.slug.split('/').pop() ?? parentSvc.slug;
                addLink(parentSvc.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service');
            }
            // Parent location page
            const parentLoc = sameLocale.find((p) => p.page_type === 'location' && p.location_id === page.location_id);
            if (parentLoc) {
                const cityPart = parentLoc.slug.split('/').pop() ?? parentLoc.slug;
                addLink(parentLoc.slug, servicesInCityLabel(cityPart, lang), 'location');
            }
            // 2-3 sibling service+location pages (same service, different city)
            const siblings = sameLocale
                .filter((p) => p.page_type === 'service_location' &&
                p.service_id === page.service_id &&
                p.id !== page.id)
                .slice(0, 3);
            for (const s of siblings) {
                const cityPart = s.slug.split('/').pop() ?? s.slug;
                addLink(s.slug, capitalize(cityPart.replace(/-/g, ' ')), 'service_location');
            }
            break;
        }
        case 'homepage': {
            // All service pages
            const services = sameLocale.filter((p) => p.page_type === 'service');
            for (const s of services.slice(0, 6)) {
                const svcPart = s.slug.split('/').pop() ?? s.slug;
                addLink(s.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service');
            }
            // Top location pages by priority (already sorted in allPages)
            const locations = sameLocale
                .filter((p) => p.page_type === 'location')
                .sort((a, b) => b.priority - a.priority);
            for (const l of locations.slice(0, 4)) {
                const cityPart = l.slug.split('/').pop() ?? l.slug;
                addLink(l.slug, capitalize(cityPart.replace(/-/g, ' ')), 'location');
            }
            break;
        }
        case 'about': {
            // Link to services page and FAQ
            const faq = sameLocale.find((p) => p.page_type === 'faq');
            if (faq)
                addLink(faq.slug, faqLabel(lang), 'faq');
            const firstService = sameLocale.find((p) => p.page_type === 'service');
            if (firstService) {
                const svcPart = firstService.slug.split('/').pop() ?? firstService.slug;
                addLink(firstService.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service');
            }
            break;
        }
        case 'contact': {
            // Link to about and services
            const about = sameLocale.find((p) => p.page_type === 'about');
            if (about)
                addLink(about.slug, aboutLabel(lang), 'about');
            const services = sameLocale.filter((p) => p.page_type === 'service').slice(0, 3);
            for (const s of services) {
                const svcPart = s.slug.split('/').pop() ?? s.slug;
                addLink(s.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service');
            }
            break;
        }
        case 'faq': {
            const services = sameLocale.filter((p) => p.page_type === 'service').slice(0, 3);
            for (const s of services) {
                const svcPart = s.slug.split('/').pop() ?? s.slug;
                addLink(s.slug, capitalize(svcPart.replace(/-/g, ' ')), 'service');
            }
            break;
        }
    }
    return links;
}
// ─── Anchor text helpers ─────────────────────────────────────────────────────
function capitalize(str) {
    return str
        .split(' ')
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');
}
function homeLabel(lang) {
    const map = { en: 'Home', nl: 'Home', fr: 'Accueil', de: 'Startseite' };
    return map[lang] ?? 'Home';
}
function contactLabel(lang) {
    const map = {
        en: 'Contact Us',
        nl: 'Contact Opnemen',
        fr: 'Nous Contacter',
        de: 'Kontakt Aufnehmen',
    };
    return map[lang] ?? 'Contact Us';
}
function faqLabel(lang) {
    const map = {
        en: 'FAQ',
        nl: 'Veelgestelde Vragen',
        fr: 'FAQ',
        de: 'Häufige Fragen',
    };
    return map[lang] ?? 'FAQ';
}
function aboutLabel(lang) {
    const map = {
        en: 'About Us',
        nl: 'Over Ons',
        fr: 'À Propos',
        de: 'Über Uns',
    };
    return map[lang] ?? 'About Us';
}
function localServiceAnchor(citySlug, lang) {
    const city = capitalize(citySlug.replace(/-/g, ' '));
    const map = {
        en: `Service in ${city}`,
        nl: `Dienst in ${city}`,
        fr: `Service à ${city}`,
        de: `Dienstleistung in ${city}`,
    };
    return map[lang] ?? `Service in ${city}`;
}
function servicesInCityLabel(citySlug, lang) {
    const city = capitalize(citySlug.replace(/-/g, ' '));
    const map = {
        en: `Services in ${city}`,
        nl: `Diensten in ${city}`,
        fr: `Services à ${city}`,
        de: `Dienstleistungen in ${city}`,
    };
    return map[lang] ?? `Services in ${city}`;
}
//# sourceMappingURL=linking-engine.js.map