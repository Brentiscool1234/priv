import type { GeneratedPage, BusinessProfile } from '../types';
import { getLocaleConfig } from '../lib/locales';

type SchemaObject = Record<string, unknown>;

/**
 * Generate an array of JSON-LD schema objects for a given page.
 */
export function generateSchema(
  page: GeneratedPage,
  profile: BusinessProfile,
  locale: string
): SchemaObject[] {
  const schemas: SchemaObject[] = [];
  const loc = getLocaleConfig(locale);
  const lang = loc.language;
  const businessName = profile.business_name ?? 'Our Business';
  const description = profile.description ?? `Professional services by ${businessName}`;

  // ── Always present ─────────────────────────────────────────────────────────

  const organization = buildOrganization(profile, businessName, lang);
  const breadcrumb = buildBreadcrumb(page, businessName, lang);
  const webPage = buildWebPage(page, businessName, description, lang);

  schemas.push(organization, breadcrumb, webPage);

  // ── Page-type specific additions ───────────────────────────────────────────

  switch (page.page_type) {
    case 'homepage':
      schemas.push(buildWebSite(page, businessName, lang));
      schemas.push(buildLocalBusiness(profile, businessName, description, lang));
      break;

    case 'service':
      schemas.push(buildService(page, businessName, description, lang));
      break;

    case 'location':
      schemas.push(buildLocalBusiness(profile, businessName, description, lang, page));
      break;

    case 'service_location':
      schemas.push(buildService(page, businessName, description, lang));
      schemas.push(buildLocalBusiness(profile, businessName, description, lang, page));
      break;

    case 'faq':
      schemas.push(buildFAQPage(page, lang));
      break;

    case 'about':
    case 'contact':
      // webPage + organization already included
      break;
  }

  return schemas;
}

// ─── Schema Builder Functions ─────────────────────────────────────────────────

function buildOrganization(
  profile: BusinessProfile,
  businessName: string,
  _lang: string
): SchemaObject {
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
  return schema;
}

function buildWebSite(
  page: GeneratedPage,
  businessName: string,
  _lang: string
): SchemaObject {
  const baseUrl = `/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: businessName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}?s={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildWebPage(
  page: GeneratedPage,
  businessName: string,
  description: string,
  _lang: string
): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.meta_title ?? page.h1 ?? businessName,
    description: page.meta_description ?? description,
    url: `/${page.slug}`,
    inLanguage: page.locale,
    breadcrumb: { '@id': `/${page.slug}#breadcrumb` },
  };
}

function buildBreadcrumb(
  page: GeneratedPage,
  businessName: string,
  _lang: string
): SchemaObject {
  const parts = page.slug.split('/').filter(Boolean);
  const items: SchemaObject[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: businessName,
      item: '/',
    },
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

function buildService(
  page: GeneratedPage,
  businessName: string,
  description: string,
  _lang: string
): SchemaObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1 ?? page.meta_title ?? 'Service',
    description: page.meta_description ?? description,
    provider: {
      '@type': 'Organization',
      name: businessName,
    },
    url: `/${page.slug}`,
    serviceType: page.h1 ?? 'Professional Service',
    areaServed: extractCityFromSlug(page.slug),
  };
}

function buildLocalBusiness(
  profile: BusinessProfile,
  businessName: string,
  description: string,
  _lang: string,
  page?: GeneratedPage
): SchemaObject {
  const schema: SchemaObject = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    description,
    url: page ? `/${page.slug}` : '/',
  };

  if (profile.phone) schema['telephone'] = profile.phone;
  if (profile.email) schema['email'] = profile.email;
  if (profile.logo_url) {
    schema['image'] = { '@type': 'ImageObject', url: profile.logo_url };
  }
  if (profile.booking_url) schema['hasMap'] = profile.booking_url;

  // Extract city from page slug for address
  if (page) {
    const city = extractCityFromSlug(page.slug);
    if (city) {
      schema['address'] = {
        '@type': 'PostalAddress',
        addressLocality: capitalize(city.replace(/-/g, ' ')),
      };
    }
  }

  if (profile.years_in_business) {
    const founded = new Date().getFullYear() - profile.years_in_business;
    schema['foundingDate'] = String(founded);
  }

  return schema;
}

function buildFAQPage(page: GeneratedPage, _lang: string): SchemaObject {
  // Parse FAQ questions from schema_json if available, else build stubs
  const entities: SchemaObject[] = [];

  // Try to extract Q&A pairs from the HTML content
  if (page.content_html) {
    const qaPairs = extractFAQFromHtml(page.content_html);
    for (const { question, answer } of qaPairs) {
      entities.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities.length > 0 ? entities : [
      {
        '@type': 'Question',
        name: 'What services do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a wide range of professional services. Contact us for details.',
        },
      },
    ],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractCityFromSlug(slug: string): string {
  const parts = slug.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

interface QAPair {
  question: string;
  answer: string;
}

/**
 * Very lightweight FAQ extraction from generated HTML.
 * Looks for <dt>/<dd> pairs or <h3>/<p> patterns.
 */
function extractFAQFromHtml(html: string): QAPair[] {
  const pairs: QAPair[] = [];

  // Match <dt>...</dt><dd>...</dd>
  const dtddRegex = /<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/gis;
  let m: RegExpExecArray | null;
  while ((m = dtddRegex.exec(html)) !== null) {
    const question = stripTags(m[1]).trim();
    const answer = stripTags(m[2]).trim();
    if (question && answer) pairs.push({ question, answer });
  }

  // If no dt/dd, try h3+p pattern inside faq sections
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

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
