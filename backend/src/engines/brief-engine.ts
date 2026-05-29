import { v4 as uuidv4 } from 'uuid';
import type {
  PagePlan,
  PageBrief,
  BusinessProfile,
  Service,
  Location,
  InternalLink,
} from '../types';
import { getLocaleConfig } from '../lib/locales';
import { getTemplate } from '../lib/templates';
import { getLocalizedCityName } from './locale-engine';

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
export function generateBrief(ctx: BriefContext): PageBrief {
  const { plan, businessProfile, service, location, allPlans } = ctx;
  const locale = plan.locale;
  const localeConfig = getLocaleConfig(locale);
  const template = getTemplate(plan.page_type);
  const businessName = businessProfile.business_name ?? 'Our Business';
  const now = new Date().toISOString();

  const cityName = location
    ? getLocalizedCityName(location.city, locale)
    : undefined;
  const primaryKeyword = buildPrimaryKeyword(plan, service, cityName, locale);

  const h1 = buildH1(plan, primaryKeyword, cityName, businessName, locale);
  const metaTitle = buildMetaTitle(plan, primaryKeyword, cityName, businessName, locale);
  const metaDescription = buildMetaDescription(
    plan,
    primaryKeyword,
    cityName,
    businessName,
    locale,
    localeConfig.cta_style
  );

  const secondaryKeywords = buildSecondaryKeywords(plan, service, cityName, locale);
  const faqQuestions = buildFaqQuestions(plan, service, cityName, businessName, locale);
  const internalLinks = buildInternalLinks(plan, allPlans, locale);
  const ctaAngle = buildCtaAngle(plan, localeConfig.cta_style, cityName, locale);

  return {
    id: uuidv4(),
    plan_id: plan.id,
    project_id: plan.project_id,
    page_type: plan.page_type,
    locale,
    slug: plan.slug,
    primary_keyword: primaryKeyword,
    secondary_keywords: secondaryKeywords,
    h1,
    meta_title: metaTitle,
    meta_description: metaDescription,
    section_structure: template.sections,
    cta_angle: ctaAngle,
    faq_questions: faqQuestions,
    internal_links: internalLinks,
    schema_types: template.schema_types,
    status: 'approved',
    created_at: now,
  };
}

// ─── Keyword Builders ────────────────────────────────────────────────────────

function buildPrimaryKeyword(
  plan: PagePlan,
  service?: Service,
  cityName?: string,
  locale?: string
): string {
  switch (plan.page_type) {
    case 'homepage':
      return service ? service.primary_keyword ?? service.name : 'Professional Services';
    case 'about':
      return 'About Us';
    case 'contact':
      return contactLabel(locale);
    case 'faq':
      return faqLabel(locale);
    case 'service':
      return service?.primary_keyword ?? service?.name ?? 'Professional Service';
    case 'location':
      return cityName ? `Services in ${cityName}` : 'Local Services';
    case 'service_location':
      if (service && cityName) {
        return `${service.primary_keyword ?? service.name} ${cityName}`;
      }
      return service?.primary_keyword ?? service?.name ?? 'Local Service';
    default:
      return 'Professional Service';
  }
}

function buildH1(
  plan: PagePlan,
  primaryKeyword: string,
  cityName: string | undefined,
  businessName: string,
  locale: string
): string {
  switch (plan.page_type) {
    case 'homepage':
      return businessName;
    case 'about':
      return aboutH1(businessName, locale);
    case 'contact':
      return contactH1(locale);
    case 'faq':
      return faqH1(locale);
    case 'service':
      return primaryKeyword;
    case 'location':
      return cityName ? localH1(cityName, locale) : primaryKeyword;
    case 'service_location':
      return cityName ? `${primaryKeyword}` : primaryKeyword;
    default:
      return primaryKeyword;
  }
}

function buildMetaTitle(
  plan: PagePlan,
  primaryKeyword: string,
  cityName: string | undefined,
  businessName: string,
  _locale: string
): string {
  const max = 60;
  let title: string;
  switch (plan.page_type) {
    case 'homepage':
      title = `${businessName} | ${primaryKeyword}`;
      break;
    case 'service_location':
      title = cityName
        ? `${primaryKeyword} | ${businessName} | ${cityName}`
        : `${primaryKeyword} | ${businessName}`;
      break;
    default:
      title = `${primaryKeyword} | ${businessName}`;
  }
  return title.length > max ? title.substring(0, max - 1) + '…' : title;
}

function buildMetaDescription(
  plan: PagePlan,
  primaryKeyword: string,
  cityName: string | undefined,
  businessName: string,
  locale: string,
  ctaStyle: string
): string {
  let desc: string;
  const lang = getLocaleConfig(locale).language;

  switch (plan.page_type) {
    case 'homepage':
      desc = metaDescByLang(lang, {
        en: `${businessName} offers expert ${primaryKeyword.toLowerCase()} services. ${ctaStyle} today!`,
        nl: `${businessName} biedt professionele diensten. ${ctaStyle} vandaag!`,
        fr: `${businessName} offre des services professionnels. ${ctaStyle} aujourd'hui!`,
        de: `${businessName} bietet professionelle Dienstleistungen. ${ctaStyle} heute!`,
      });
      break;
    case 'service':
      desc = metaDescByLang(lang, {
        en: `Expert ${primaryKeyword.toLowerCase()} services by ${businessName}. Reliable, professional, and affordable. ${ctaStyle} now!`,
        nl: `Professionele ${primaryKeyword.toLowerCase()} door ${businessName}. Betrouwbaar en betaalbaar. ${ctaStyle}!`,
        fr: `Services de ${primaryKeyword.toLowerCase()} par ${businessName}. Fiable et professionnel. ${ctaStyle}!`,
        de: `Professionelle ${primaryKeyword.toLowerCase()} von ${businessName}. Zuverlässig und erschwinglich. ${ctaStyle}!`,
      });
      break;
    case 'location':
      desc = cityName
        ? metaDescByLang(lang, {
            en: `${businessName} provides professional services in ${cityName}. Local experts you can trust. ${ctaStyle} today!`,
            nl: `${businessName} biedt professionele diensten in ${cityName}. Lokale experts. ${ctaStyle}!`,
            fr: `${businessName} offre des services à ${cityName}. Experts locaux de confiance. ${ctaStyle}!`,
            de: `${businessName} bietet professionelle Dienstleistungen in ${cityName}. Lokale Experten. ${ctaStyle}!`,
          })
        : `${businessName} provides professional local services. ${ctaStyle} today!`;
      break;
    case 'service_location':
      desc = cityName
        ? metaDescByLang(lang, {
            en: `Looking for ${primaryKeyword.toLowerCase()} in ${cityName}? ${businessName} delivers expert results. ${ctaStyle}!`,
            nl: `Op zoek naar ${primaryKeyword.toLowerCase()} in ${cityName}? ${businessName} levert kwaliteit. ${ctaStyle}!`,
            fr: `Vous cherchez ${primaryKeyword.toLowerCase()} à ${cityName}? ${businessName} est votre expert local. ${ctaStyle}!`,
            de: `Suchen Sie ${primaryKeyword.toLowerCase()} in ${cityName}? ${businessName} liefert Qualität. ${ctaStyle}!`,
          })
        : `${primaryKeyword} services by ${businessName}. ${ctaStyle}!`;
      break;
    default:
      desc = `${businessName} – ${primaryKeyword}. ${ctaStyle}!`;
  }

  // Enforce 150-160 chars
  if (desc.length > 160) desc = desc.substring(0, 157) + '...';
  if (desc.length < 140) desc = desc + (' ').repeat(0); // leave short ones as-is

  return desc;
}

function buildSecondaryKeywords(
  plan: PagePlan,
  service?: Service,
  cityName?: string,
  _locale?: string
): string[] {
  const base = service?.secondary_keywords ?? [];
  if (cityName && plan.page_type === 'service_location') {
    return [...base, cityName];
  }
  return base;
}

function buildFaqQuestions(
  plan: PagePlan,
  service: Service | undefined,
  cityName: string | undefined,
  businessName: string,
  locale: string
): string[] {
  const lang = getLocaleConfig(locale).language;
  const svcName = service?.name ?? 'service';

  const faqsByType: Record<string, Record<string, string[]>> = {
    homepage: {
      en: [
        `What services does ${businessName} offer?`,
        `How can I get a quote from ${businessName}?`,
        `What areas does ${businessName} serve?`,
        `How long has ${businessName} been in business?`,
      ],
      nl: [
        `Welke diensten biedt ${businessName} aan?`,
        `Hoe vraag ik een offerte aan bij ${businessName}?`,
        `In welke regio's is ${businessName} actief?`,
        `Hoe lang bestaat ${businessName} al?`,
      ],
      fr: [
        `Quels services ${businessName} propose-t-il?`,
        `Comment obtenir un devis de ${businessName}?`,
        `Quelles zones ${businessName} dessert-il?`,
        `Depuis combien de temps ${businessName} est-il en activité?`,
      ],
      de: [
        `Welche Leistungen bietet ${businessName} an?`,
        `Wie erhalte ich ein Angebot von ${businessName}?`,
        `Welche Gebiete bedient ${businessName}?`,
        `Wie lange ist ${businessName} schon im Geschäft?`,
      ],
    },
    service: {
      en: [
        `What does ${svcName} include?`,
        `How much does ${svcName} cost?`,
        `How long does ${svcName} take?`,
        `Do you offer a guarantee on ${svcName}?`,
        `Can I book ${svcName} online?`,
      ],
      nl: [
        `Wat is inbegrepen bij ${svcName}?`,
        `Wat kost ${svcName}?`,
        `Hoe lang duurt ${svcName}?`,
        `Bieden jullie garantie op ${svcName}?`,
        `Kan ik ${svcName} online boeken?`,
      ],
      fr: [
        `Que comprend le service de ${svcName}?`,
        `Combien coûte ${svcName}?`,
        `Combien de temps prend ${svcName}?`,
        `Offrez-vous une garantie sur ${svcName}?`,
        `Puis-je réserver ${svcName} en ligne?`,
      ],
      de: [
        `Was beinhaltet ${svcName}?`,
        `Was kostet ${svcName}?`,
        `Wie lange dauert ${svcName}?`,
        `Bieten Sie eine Garantie auf ${svcName}?`,
        `Kann ich ${svcName} online buchen?`,
      ],
    },
    location: {
      en: [
        `Does ${businessName} serve ${cityName ?? 'this area'}?`,
        `What services are available in ${cityName ?? 'this area'}?`,
        `How quickly can ${businessName} reach ${cityName ?? 'my location'}?`,
        `Are there local offices near ${cityName ?? 'my area'}?`,
      ],
      nl: [
        `Is ${businessName} actief in ${cityName ?? 'dit gebied'}?`,
        `Welke diensten zijn beschikbaar in ${cityName ?? 'dit gebied'}?`,
        `Hoe snel kan ${businessName} in ${cityName ?? 'mijn locatie'} zijn?`,
        `Zijn er lokale vestigingen in de buurt van ${cityName ?? 'mijn gemeente'}?`,
      ],
      fr: [
        `${businessName} intervient-il à ${cityName ?? 'cette zone'}?`,
        `Quels services sont disponibles à ${cityName ?? 'cette zone'}?`,
        `Dans quel délai ${businessName} peut-il intervenir à ${cityName ?? 'mon adresse'}?`,
        `Y a-t-il des bureaux locaux près de ${cityName ?? 'ma zone'}?`,
      ],
      de: [
        `Ist ${businessName} in ${cityName ?? 'diesem Gebiet'} tätig?`,
        `Welche Leistungen sind in ${cityName ?? 'diesem Gebiet'} verfügbar?`,
        `Wie schnell kann ${businessName} ${cityName ?? 'meinen Standort'} erreichen?`,
        `Gibt es lokale Büros in der Nähe von ${cityName ?? 'meiner Stadt'}?`,
      ],
    },
    service_location: {
      en: [
        `How much does ${svcName} cost in ${cityName}?`,
        `Is ${businessName} available for ${svcName} in ${cityName}?`,
        `How quickly can you provide ${svcName} in ${cityName}?`,
        `What is included in ${svcName} in ${cityName}?`,
        `Do you offer free quotes for ${svcName} in ${cityName}?`,
        `Are you licensed for ${svcName} in ${cityName}?`,
      ],
      nl: [
        `Wat kost ${svcName} in ${cityName}?`,
        `Is ${businessName} beschikbaar voor ${svcName} in ${cityName}?`,
        `Hoe snel kunnen jullie ${svcName} leveren in ${cityName}?`,
        `Wat is inbegrepen bij ${svcName} in ${cityName}?`,
        `Bieden jullie gratis offertes voor ${svcName} in ${cityName}?`,
        `Zijn jullie vergund voor ${svcName} in ${cityName}?`,
      ],
      fr: [
        `Combien coûte ${svcName} à ${cityName}?`,
        `${businessName} est-il disponible pour ${svcName} à ${cityName}?`,
        `Dans quel délai pouvez-vous fournir ${svcName} à ${cityName}?`,
        `Que comprend ${svcName} à ${cityName}?`,
        `Proposez-vous des devis gratuits pour ${svcName} à ${cityName}?`,
        `Êtes-vous agréé pour ${svcName} à ${cityName}?`,
      ],
      de: [
        `Was kostet ${svcName} in ${cityName}?`,
        `Ist ${businessName} für ${svcName} in ${cityName} verfügbar?`,
        `Wie schnell können Sie ${svcName} in ${cityName} anbieten?`,
        `Was beinhaltet ${svcName} in ${cityName}?`,
        `Bieten Sie kostenlose Angebote für ${svcName} in ${cityName}?`,
        `Sind Sie für ${svcName} in ${cityName} zugelassen?`,
      ],
    },
    faq: {
      en: [
        'What services do you offer?',
        'How do I get a quote?',
        'Do you offer emergency services?',
        'What payment methods do you accept?',
        'Are you insured and licensed?',
        'How long have you been operating?',
        'What areas do you cover?',
        'Do you offer guarantees?',
        'Can I see examples of your work?',
        'How do I cancel or reschedule?',
      ],
      nl: [
        'Welke diensten bieden jullie aan?',
        'Hoe vraag ik een offerte aan?',
        'Bieden jullie spoeddiensten aan?',
        'Welke betaalmethoden accepteren jullie?',
        'Zijn jullie verzekerd en vergund?',
        'Hoe lang zijn jullie al actief?',
        'Welke regio\'s bedienen jullie?',
        'Bieden jullie garanties?',
        'Kan ik voorbeelden van jullie werk zien?',
        'Hoe annuleer of verzet ik een afspraak?',
      ],
      fr: [
        'Quels services proposez-vous?',
        'Comment obtenir un devis?',
        'Proposez-vous des services d\'urgence?',
        'Quels modes de paiement acceptez-vous?',
        'Êtes-vous assuré et agréé?',
        'Depuis combien de temps êtes-vous en activité?',
        'Quelles zones couvrez-vous?',
        'Offrez-vous des garanties?',
        'Puis-je voir des exemples de votre travail?',
        'Comment annuler ou reporter un rendez-vous?',
      ],
      de: [
        'Welche Leistungen bieten Sie an?',
        'Wie erhalte ich ein Angebot?',
        'Bieten Sie Notfalldienste an?',
        'Welche Zahlungsmethoden akzeptieren Sie?',
        'Sind Sie versichert und zugelassen?',
        'Wie lange sind Sie schon tätig?',
        'Welche Gebiete decken Sie ab?',
        'Bieten Sie Garantien an?',
        'Kann ich Beispiele Ihrer Arbeit sehen?',
        'Wie kann ich einen Termin absagen oder verschieben?',
      ],
    },
    about: {
      en: [
        `When was ${businessName} founded?`,
        `What makes ${businessName} different from competitors?`,
        `Is ${businessName} licensed and insured?`,
      ],
      nl: [
        `Wanneer is ${businessName} opgericht?`,
        `Wat maakt ${businessName} uniek ten opzichte van concurrenten?`,
        `Is ${businessName} vergund en verzekerd?`,
      ],
      fr: [
        `Quand ${businessName} a-t-il été fondé?`,
        `Qu'est-ce qui distingue ${businessName} de ses concurrents?`,
        `${businessName} est-il agréé et assuré?`,
      ],
      de: [
        `Wann wurde ${businessName} gegründet?`,
        `Was unterscheidet ${businessName} von Mitbewerbern?`,
        `Ist ${businessName} lizenziert und versichert?`,
      ],
    },
    contact: {
      en: [
        `How can I contact ${businessName}?`,
        `What are your business hours?`,
        `How quickly do you respond to inquiries?`,
      ],
      nl: [
        `Hoe kan ik ${businessName} bereiken?`,
        `Wat zijn jullie openingstijden?`,
        `Hoe snel reageren jullie op vragen?`,
      ],
      fr: [
        `Comment contacter ${businessName}?`,
        `Quelles sont vos heures d'ouverture?`,
        `Dans quel délai répondez-vous aux demandes?`,
      ],
      de: [
        `Wie kann ich ${businessName} kontaktieren?`,
        `Wie sind Ihre Öffnungszeiten?`,
        `Wie schnell antworten Sie auf Anfragen?`,
      ],
    },
  };

  const byType = faqsByType[plan.page_type] ?? faqsByType['homepage'];
  return byType[lang] ?? byType['en'];
}

function buildInternalLinks(
  plan: PagePlan,
  allPlans: PagePlan[],
  _locale: string
): InternalLink[] {
  const links: InternalLink[] = [];
  const sameLocale = allPlans.filter((p) => p.locale === plan.locale);

  // Always link to homepage and contact
  const homepage = sameLocale.find((p) => p.page_type === 'homepage');
  const contact = sameLocale.find((p) => p.page_type === 'contact');

  if (homepage && homepage.id !== plan.id) {
    links.push({ slug: homepage.slug, anchor_text: 'Home', page_type: 'homepage' });
  }
  if (contact && contact.id !== plan.id) {
    links.push({ slug: contact.slug, anchor_text: 'Contact Us', page_type: 'contact' });
  }

  switch (plan.page_type) {
    case 'service': {
      // Link to top 5 service+location pages for this service
      const related = sameLocale
        .filter((p) => p.page_type === 'service_location' && p.service_id === plan.service_id)
        .slice(0, 5);
      for (const r of related) {
        links.push({ slug: r.slug, anchor_text: r.slug.split('/').pop() ?? r.slug, page_type: 'service_location' });
      }
      break;
    }
    case 'location': {
      // Link to all services in this city
      const related = sameLocale
        .filter((p) => p.page_type === 'service_location' && p.location_id === plan.location_id)
        .slice(0, 8);
      for (const r of related) {
        links.push({ slug: r.slug, anchor_text: r.slug.split('/').pop() ?? r.slug, page_type: 'service_location' });
      }
      break;
    }
    case 'service_location': {
      // Parent service, parent location, 3 siblings
      const parentSvc = sameLocale.find(
        (p) => p.page_type === 'service' && p.service_id === plan.service_id
      );
      const parentLoc = sameLocale.find(
        (p) => p.page_type === 'location' && p.location_id === plan.location_id
      );
      if (parentSvc) {
        links.push({ slug: parentSvc.slug, anchor_text: parentSvc.slug.split('/').pop() ?? parentSvc.slug, page_type: 'service' });
      }
      if (parentLoc) {
        links.push({ slug: parentLoc.slug, anchor_text: parentLoc.slug.split('/').pop() ?? parentLoc.slug, page_type: 'location' });
      }
      const siblings = sameLocale
        .filter(
          (p) =>
            p.page_type === 'service_location' &&
            p.service_id === plan.service_id &&
            p.id !== plan.id
        )
        .slice(0, 3);
      for (const s of siblings) {
        links.push({ slug: s.slug, anchor_text: s.slug.split('/').pop() ?? s.slug, page_type: 'service_location' });
      }
      break;
    }
    case 'homepage': {
      const services = sameLocale.filter((p) => p.page_type === 'service').slice(0, 6);
      const topLocs = sameLocale.filter((p) => p.page_type === 'location').slice(0, 4);
      for (const s of services) {
        links.push({ slug: s.slug, anchor_text: s.slug.split('/').pop() ?? s.slug, page_type: 'service' });
      }
      for (const l of topLocs) {
        links.push({ slug: l.slug, anchor_text: l.slug.split('/').pop() ?? l.slug, page_type: 'location' });
      }
      break;
    }
  }

  return links;
}

function buildCtaAngle(
  plan: PagePlan,
  ctaStyle: string,
  cityName: string | undefined,
  _locale: string
): string {
  if (cityName && (plan.page_type === 'service_location' || plan.page_type === 'location')) {
    return `${ctaStyle} in ${cityName}`;
  }
  return ctaStyle;
}

// ─── Locale label helpers ────────────────────────────────────────────────────

function contactLabel(locale?: string): string {
  const lang = locale ? getLocaleConfig(locale).language : 'en';
  const map: Record<string, string> = { en: 'Contact Us', nl: 'Contact', fr: 'Contactez-Nous', de: 'Kontakt' };
  return map[lang] ?? 'Contact Us';
}

function faqLabel(locale?: string): string {
  const lang = locale ? getLocaleConfig(locale).language : 'en';
  const map: Record<string, string> = {
    en: 'Frequently Asked Questions',
    nl: 'Veelgestelde Vragen',
    fr: 'Foire Aux Questions',
    de: 'Häufige Fragen',
  };
  return map[lang] ?? 'FAQ';
}

function aboutH1(businessName: string, locale: string): string {
  const lang = getLocaleConfig(locale).language;
  const map: Record<string, string> = {
    en: `About ${businessName}`,
    nl: `Over ${businessName}`,
    fr: `À Propos de ${businessName}`,
    de: `Über ${businessName}`,
  };
  return map[lang] ?? `About ${businessName}`;
}

function contactH1(locale: string): string {
  const lang = getLocaleConfig(locale).language;
  const map: Record<string, string> = {
    en: 'Contact Us',
    nl: 'Neem Contact Op',
    fr: 'Contactez-Nous',
    de: 'Kontaktieren Sie Uns',
  };
  return map[lang] ?? 'Contact Us';
}

function faqH1(locale: string): string {
  const lang = getLocaleConfig(locale).language;
  const map: Record<string, string> = {
    en: 'Frequently Asked Questions',
    nl: 'Veelgestelde Vragen',
    fr: 'Foire Aux Questions',
    de: 'Häufig Gestellte Fragen',
  };
  return map[lang] ?? 'FAQ';
}

function localH1(cityName: string, locale: string): string {
  const lang = getLocaleConfig(locale).language;
  const map: Record<string, string> = {
    en: `Services in ${cityName}`,
    nl: `Diensten in ${cityName}`,
    fr: `Services à ${cityName}`,
    de: `Dienstleistungen in ${cityName}`,
  };
  return map[lang] ?? `Services in ${cityName}`;
}

function metaDescByLang(lang: string, map: Record<string, string>): string {
  return map[lang] ?? map['en'];
}
