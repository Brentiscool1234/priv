import type { GeneratedPage, BusinessProfile, PageImage } from '../types';
import { getLocaleConfig } from '../lib/locales';

type SchemaObject = Record<string, unknown>;

export function generateSchema(
  page: GeneratedPage,
  profile: BusinessProfile,
  locale: string
): SchemaObject[] {
  const schemas: SchemaObject[] = [];
  const loc = getLocaleConfig(locale);
  const businessName = profile.business_name ?? 'Our Business';
  const description = profile.description ?? `Professional services by ${businessName}`;
  const images = page.images_json ?? [];

  // Always present
  schemas.push(buildOrganization(profile, businessName));
  schemas.push(buildBreadcrumb(page, businessName));
  schemas.push(buildWebPage(page, businessName, description));

  // Page-type specific
  switch (page.page_type) {
    case 'homepage':
      schemas.push(buildWebSite(page, businessName));
      schemas.push(buildLocalBusiness(profile, businessName, description, page));
      break;

    case 'service':
      schemas.push(buildService(page, businessName, description));
      if (hasProcessSteps(page.content_html)) {
        schemas.push(buildHowTo(page, businessName));
      }
      break;

    case 'location':
      schemas.push(buildLocalBusiness(profile, businessName, description, page));
      break;

    case 'service_location':
      schemas.push(buildService(page, businessName, description));
      schemas.push(buildLocalBusiness(profile, businessName, description, page));
      if (hasProcessSteps(page.content_html)) {
        schemas.push(buildHowTo(page, businessName));
      }
      break;

    case 'faq':
      schemas.push(buildFAQPage(page));
      break;

    case 'about':
    case 'contact':
      break;
  }

  // Add ImageObject schema if we have images
  for (const img of images) {
    if (img.wp_url) {
      schemas.push(buildImageObject(img, page, businessName));
    }
  }

  return schemas;
}

// ─── Schema Builders ──────────────────────────────────────────────────────────

function buildOrganization(profile: BusinessProfile, businessName: string): SchemaObject {
  const schema: SchemaObject = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: businessName,
  };
  if (profile.phone) schema['telephone'] = profile.phone;
  if (profile.email) schema['email'] = profile.email;
  if (profile.logo_url) schema['logo'] = { '@type': 'ImageObject', url: profile.logo_url };
  if (profile.booking_url) schema['url'] = profile.booking_url;
  if (profile.description) schema['description'] = profile.description;
  if (profile.years_in_business) {
    schema['foundingDate'] = String(new Date().getFullYear() - profile.years_in_business);
  }
  return schema;
}

function buildWebSite(page: GeneratedPage, businessName: string): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: businessName,
    url: `/${page.slug}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `/?s={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildWebPage(page: GeneratedPage, businessName: string, description: string): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.meta_title ?? page.h1 ?? businessName,
    description: page.meta_description ?? description,
    url: `/${page.slug}`,
    inLanguage: page.locale,
    breadcrumb: { '@id': `/${page.slug}#breadcrumb` },
    dateModified: page.updated_at,
  };
}

function buildBreadcrumb(page: GeneratedPage, businessName: string): SchemaObject {
  const parts = page.slug.split('/').filter(Boolean);
  const items: SchemaObject[] = [
    { '@type': 'ListItem', position: 1, name: businessName, item: '/' },
  ];

  let cumPath = '';
  for (let i = 0; i < parts.length; i++) {
    cumPath += `/${parts[i]}`;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: capitalize(parts[i].replace(/-/g, ' ')),
      item: cumPath,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `/${page.slug}#breadcrumb`,
    itemListElement: items,
  };
}

function buildService(page: GeneratedPage, businessName: string, description: string): SchemaObject {
  const city = extractCityFromSlug(page.slug);
  const schema: SchemaObject = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1 ?? page.meta_title ?? 'Professional Service',
    description: page.meta_description ?? description,
    provider: {
      '@type': 'LocalBusiness',
      name: businessName,
    },
    url: `/${page.slug}`,
    serviceType: page.h1 ?? 'Professional Service',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${page.h1 ?? 'Service'} Packages`,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'PriceSpecification',
        description: 'Contact us for a free quote',
      },
    },
  };

  if (city) {
    schema['areaServed'] = {
      '@type': 'City',
      name: capitalize(city.replace(/-/g, ' ')),
    };
  }

  return schema;
}

function buildLocalBusiness(
  profile: BusinessProfile,
  businessName: string,
  description: string,
  page: GeneratedPage
): SchemaObject {
  const city = extractCityFromSlug(page.slug);
  const schema: SchemaObject = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    description,
    url: `/${page.slug}`,
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '14:00',
      },
    ],
  };

  if (profile.phone) schema['telephone'] = profile.phone;
  if (profile.email) schema['email'] = profile.email;
  if (profile.logo_url) {
    schema['image'] = { '@type': 'ImageObject', url: profile.logo_url };
  }
  if (profile.booking_url) schema['hasMap'] = profile.booking_url;
  if (profile.years_in_business) {
    schema['foundingDate'] = String(new Date().getFullYear() - profile.years_in_business);
  }

  if (city) {
    schema['address'] = {
      '@type': 'PostalAddress',
      addressLocality: capitalize(city.replace(/-/g, ' ')),
      addressCountry: 'US',
    };
    schema['areaServed'] = { '@type': 'City', name: capitalize(city.replace(/-/g, ' ')) };
  }

  return schema;
}

function buildHowTo(page: GeneratedPage, businessName: string): SchemaObject {
  const steps = extractProcessSteps(page.content_html ?? '');

  const schemaSteps = steps.length > 0
    ? steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
      }))
    : [
        { '@type': 'HowToStep', position: 1, name: 'Contact Us', text: 'Get in touch to discuss your requirements and schedule a visit.' },
        { '@type': 'HowToStep', position: 2, name: 'Assessment', text: 'We assess the scope of work and provide a detailed quote.' },
        { '@type': 'HowToStep', position: 3, name: 'Service Delivery', text: 'Our team completes the work to the highest standard.' },
        { '@type': 'HowToStep', position: 4, name: 'Follow-Up', text: 'We confirm your satisfaction and address any questions.' },
      ];

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How ${page.h1 ?? 'Our Service'} Works`,
    description: page.meta_description ?? `Step-by-step guide to our ${page.h1 ?? 'service'} process by ${businessName}`,
    provider: { '@type': 'Organization', name: businessName },
    step: schemaSteps,
  };
}

function buildFAQPage(page: GeneratedPage): SchemaObject {
  const qaPairs = extractFAQFromHtml(page.content_html ?? '');
  const entities: SchemaObject[] = qaPairs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  }));

  if (entities.length === 0) {
    entities.push({
      '@type': 'Question',
      name: 'What services do you offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer a wide range of professional services. Contact us for details.',
      },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities,
  };
}

function buildImageObject(img: PageImage, page: GeneratedPage, businessName: string): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: img.alt,
    contentUrl: img.wp_url,
    url: `/${page.slug}`,
    description: img.alt,
    creator: { '@type': 'Organization', name: businessName },
    representativeOfPage: img.slot === 'hero',
  };
}

// ─── Content Parsers ──────────────────────────────────────────────────────────

interface QAPair { question: string; answer: string }
interface ProcessStep { name: string; text: string }

function hasProcessSteps(html: string | undefined): boolean {
  if (!html) return false;
  return /<ol[^>]*>[\s\S]*?<li/i.test(html);
}

function extractProcessSteps(html: string): ProcessStep[] {
  const steps: ProcessStep[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;

  // Only extract from <ol> blocks
  const olBlocks = [...html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)];
  if (olBlocks.length === 0) return steps;

  const olHtml = olBlocks[0][1];
  while ((m = liRegex.exec(olHtml)) !== null) {
    const raw = stripTags(m[1]).trim();
    if (!raw) continue;
    // First sentence or first 60 chars as name, rest as text
    const dotIdx = raw.indexOf('.');
    const name = dotIdx > 0 && dotIdx < 80 ? raw.substring(0, dotIdx + 1) : raw.substring(0, 60);
    const text = raw;
    steps.push({ name: name.replace(/^\d+[\.\)]\s*/, ''), text });
  }

  return steps.slice(0, 8);
}

function extractFAQFromHtml(html: string): QAPair[] {
  const pairs: QAPair[] = [];
  const dtddRegex = /<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/gis;
  let m: RegExpExecArray | null;

  while ((m = dtddRegex.exec(html)) !== null) {
    const question = stripTags(m[1]).trim();
    const answer = stripTags(m[2]).trim();
    if (question && answer) pairs.push({ question, answer });
  }

  if (pairs.length === 0) {
    const h3pRegex = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gis;
    while ((m = h3pRegex.exec(html)) !== null) {
      const question = stripTags(m[1]).trim();
      const answer = stripTags(m[2]).trim();
      if (question && answer && question.includes('?')) {
        pairs.push({ question, answer });
      }
    }
  }

  return pairs.slice(0, 10);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractCityFromSlug(slug: string): string {
  const parts = slug.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
