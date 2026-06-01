import { chatCompletion, openaiLimiter } from '../lib/openai';
import { getLocaleConfig } from '../lib/locales';
import { wrapWithTheme, getThemePromptGuidelines } from '../lib/themes';
import { generatePageImages } from './image-engine';
import { logger } from '../lib/logger';
import type { PageBrief, BusinessProfile, LocaleConfig, ThemeName, PageImage } from '../types';

export interface ContentResult {
  brief_id: string;
  content_html: string;
  images: PageImage[];
  success: boolean;
  error?: string;
}

export async function generatePageContent(
  brief: PageBrief,
  businessProfile: BusinessProfile,
  locale: LocaleConfig,
  theme: ThemeName = 'horizon'
): Promise<{ html: string; images: PageImage[] }> {
  const systemPrompt = buildSystemPrompt(businessProfile, locale, brief);
  const userPrompt = buildUserPrompt(brief, businessProfile, locale);

  // Generate text and images in parallel
  const [raw, images] = await Promise.all([
    chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.72, max_tokens: 6000 }
    ),
    generatePageImages(brief, businessProfile),
  ]);

  const inner = injectImagePlaceholders(cleanHtml(raw), images);
  const html = wrapWithTheme(inner, theme);
  return { html, images };
}

export async function generateBatch(
  briefs: PageBrief[],
  businessProfile: BusinessProfile,
  localeCode: string,
  theme: ThemeName = 'horizon'
): Promise<ContentResult[]> {
  const locale = getLocaleConfig(localeCode);
  const results: ContentResult[] = [];

  const tasks = briefs.map((brief) =>
    openaiLimiter.run(async (): Promise<ContentResult> => {
      try {
        logger.info(`Generating content for brief ${brief.id} (${brief.slug})`);
        const { html, images } = await generatePageContent(brief, businessProfile, locale, theme);
        return { brief_id: brief.id, content_html: html, images, success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`Content generation failed for brief ${brief.id}: ${message}`);
        return { brief_id: brief.id, content_html: '', images: [], success: false, error: message };
      }
    })
  );

  const settled = await Promise.allSettled(tasks);
  for (const res of settled) {
    if (res.status === 'fulfilled') {
      results.push(res.value);
    } else {
      results.push({
        brief_id: 'unknown',
        content_html: '',
        images: [],
        success: false,
        error: String(res.reason),
      });
    }
  }

  return results;
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildSystemPrompt(
  profile: BusinessProfile,
  locale: LocaleConfig,
  brief: PageBrief
): string {
  const trustPoints = profile.trust_points?.length
    ? profile.trust_points.join(', ')
    : 'professional team, quality workmanship, customer satisfaction, years of experience';

  const tone = profile.tone ?? 'professional yet approachable';
  const target = profile.target_customer ?? 'homeowners and local businesses';
  const yearsExp = profile.years_in_business ? `${profile.years_in_business} years in business` : 'established local business';

  return `You are an expert SEO content strategist and copywriter creating high-authority web content for ${profile.business_name ?? 'a local service business'}.

LANGUAGE: Write exclusively in ${locale.name}. Write naturally as a native speaker — never translate literally from English.
FORMALITY: ${locale.formality}
TONE: ${tone}
TARGET AUDIENCE: ${target}
BUSINESS EXPERIENCE: ${yearsExp}
TRUST SIGNALS: ${trustPoints}
CTA PHRASE: ${locale.cta_style}

━━━ WORD COUNT REQUIREMENT ━━━
- MINIMUM 1,250 words of actual content (excluding HTML tags)
- Each section must have substantial, specific content — never filler
- Aim for 1,400–1,800 words for service and location pages

━━━ E-E-A-T CONTENT RULES ━━━
- Write from a position of deep expertise and first-hand experience
- Include specific, concrete details: timeframes, quantities, process steps, materials
- For service pages: mention specific techniques, equipment, standards used
- For location pages: reference the actual city, neighborhoods, or local context
- Include realistic customer scenarios and pain points you solve
- Avoid vague claims — every claim must be specific and credible

━━━ SEO WRITING RULES ━━━
- Primary keyword: use in H1, opening sentence, 3–4 times naturally throughout, and CTA section
- Secondary keywords: weave each in once naturally — never force them
- Each section H2 must contain a keyword or closely related phrase
- Write for searcher intent — answer what the user actually wants to know
- Include specific numbers, percentages, and timeframes wherever truthful and realistic

━━━ BANNED PHRASES (never use) ━━━
"In today's world", "Look no further", "At [company name]", "In conclusion",
"It's worth noting", "Needless to say", "As a matter of fact", "When it comes to",
"In the world of", "Navigate", "Delve", "Cutting-edge", "Seamless", "Leverage", "Game-changer"

━━━ HTML RULES ━━━
- Return ONLY valid HTML — no markdown, no \`\`\` fences, no explanatory text
- Do NOT include <html>, <head>, or <body> tags
- Testimonials section: write 2–3 realistic customer quotes with first name and city
- Process section: use <ol> with detailed 3-sentence steps
- Benefits section: use <ul> with full sentences explaining each benefit, not just labels
- FAQ section: use <dl><dt>question</dt><dd>2–4 sentence answer</dd></dl>

${getThemePromptGuidelines()}`;
}

function buildUserPrompt(
  brief: PageBrief,
  profile: BusinessProfile,
  locale: LocaleConfig
): string {
  const secondaryKws =
    brief.secondary_keywords.length > 0
      ? brief.secondary_keywords.join(', ')
      : 'none specified';
  const faqs = brief.faq_questions.length
    ? brief.faq_questions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')
    : '  1. What services do you offer?\n  2. How do I get started?';

  const city = extractCityFromSlug(brief.slug);
  const pageTypeInstructions = buildPageTypeInstructions(brief, profile, city, locale);

  return `Create a complete, high-authority ${brief.page_type.replace('_', ' ')} page for ${profile.business_name ?? 'our business'}.

━━━ PAGE BRIEF ━━━
H1: ${brief.h1 ?? brief.primary_keyword}
Primary keyword: ${brief.primary_keyword}
Secondary keywords: ${secondaryKws}
Meta description context: ${brief.meta_description ?? ''}
CTA angle: ${brief.cta_angle ?? locale.cta_style}
${city ? `Service city / area: ${city}` : ''}

━━━ REQUIRED SECTIONS (write in this exact order) ━━━
${brief.section_structure.join('\n')}

━━━ FAQ QUESTIONS (answer all of these in the faq section) ━━━
${faqs}

━━━ SECTION REQUIREMENTS ━━━
${pageTypeInstructions}

Write the full page now. Minimum 1,250 words. Return only HTML.`;
}

function buildPageTypeInstructions(
  brief: PageBrief,
  profile: BusinessProfile,
  city: string | undefined,
  locale: LocaleConfig
): string {
  const svc = brief.primary_keyword ?? 'the service';
  const biz = profile.business_name ?? 'our business';
  const cityStr = city ? `in ${city}` : 'in the local area';

  switch (brief.page_type) {
    case 'service_location':
      return `hero (120–180 words): Opening H1 with primary keyword + city. 2–3 compelling sentences on why locals need this service. CTA button.
service_intro (200–250 words): What ${svc} is, who it's for, common problems it solves. Mention ${cityStr}. Use primary keyword.
local_context (180–220 words): Why ${city ?? 'this area'} specifically — reference climate, housing stock, local regulations, or community characteristics that make this service relevant here.
service_details (220–280 words): Exactly what's included, materials or equipment used, standards followed, what happens step-by-step at the property. Be highly specific.
benefits (160–200 words): 5–6 benefits as <ul>. Each <li> must be a full 2-sentence explanation, not just a label.
process_steps (180–220 words): <ol> with 4–6 numbered steps. Each step: 3 sentences — what happens, how long it takes, what the customer does or experiences.
testimonials (120–160 words): 2–3 customer quotes. Format: "Quote text." — First Name, ${city ?? 'Local'}.
faq (answer all FAQ questions with 3–4 sentence answers each): Use <dl><dt>Q</dt><dd>A</dd></dl>.
cta_banner (80–120 words): Restate the core value proposition for ${cityStr}. Primary keyword. CTA button. No new information — this is conversion-focused.`;

    case 'service':
      return `service_hero (100–150 words): H1 with primary keyword. Why this service matters. CTA button.
service_intro (200–250 words): What ${svc} is, common situations that require it, consequences of ignoring it.
service_details (220–280 words): Exactly what the service entails — process, materials, equipment, standards, certifications. Show deep expertise.
benefits (150–200 words): 5–6 benefits as full-sentence <ul> items. Cover different buyer motivations (speed, quality, safety, value).
process_steps (180–220 words): <ol> with 5–6 steps from first contact to completion. Include timeline estimates.
service_areas (120–150 words): Cities and areas served. Brief sentence about each major service area.
testimonials (120–160 words): 2–3 customer stories with name and city.
faq (answer all FAQ questions fully): <dl> format, 3–4 sentence answers.
cta_banner (80–100 words): Final CTA. Primary keyword. Urgency or value. CTA button.`;

    case 'location':
      return `location_hero (100–150 words): H1 mentioning ${city ?? 'the city'}. Why ${biz} is the trusted choice here.
services_in_city (200–250 words): Overview of all services available ${cityStr}. Each service gets 2–3 sentences. Internal link-friendly.
about_area (180–220 words): Describe ${city ?? 'the area'} — demographics, housing, climate, why locals need these services. Show you know the community.
why_choose_us (150–200 words): What makes ${biz} the right choice for ${city ?? 'this area'} specifically. Local expertise, response time, track record.
local_testimonials (120–150 words): 2–3 customer quotes from people in ${city ?? 'the area'}.
faq (answer all FAQ questions): <dl> format, 3–4 sentence answers.
cta_banner (80–100 words): Book or call CTA for ${city ?? 'the area'}.`;

    case 'homepage':
      return `hero (100–150 words): H1 with primary keyword. Compelling value statement. Primary CTA. Make it punchy.
trust_bar (80–120 words): 4–5 trust signals (years in business, customers served, guarantee, certifications, etc.) as a short <ul>.
services_overview (220–280 words): 5–6 core services. Each gets a short paragraph (30–50 words) with H3. Mention primary keyword naturally.
why_choose_us (180–220 words): 4–5 differentiators. Be specific — not "great service" but "same-day response", "10-year warranty", etc.
testimonials (120–150 words): 2–3 specific customer testimonials with names and cities.
service_areas (100–130 words): Cities and towns served. Build internal link opportunity.
cta_banner (80–100 words): Strong final CTA. Offer or guarantee. CTA button.
faq_snippet (answer the 4 FAQ questions): <dl> format.`;

    case 'faq':
      return `faq_hero (80–100 words): H1. Brief intro explaining what customers will find here.
faq_list (answer ALL ${brief.faq_questions.length} questions, 3–6 sentences each): <dl><dt>Q</dt><dd>A</dd></dl>. Group by topic with H2 sub-headings.
cta_banner (80–100 words): If you still have questions, contact us. CTA button.`;

    case 'about':
      return `about_hero (100–140 words): H1. Who you are and what you stand for.
our_story (200–250 words): How and why the business started. Founder's motivation. Key milestones. Make it personal and real.
team_intro (150–180 words): The people behind the work. Certifications, expertise, values. Avoid stock photo descriptions.
values (140–180 words): 3–4 core values as <ul>. Each with a 2-sentence explanation. Be authentic.
trust_points (120–150 words): Licenses, insurance, certifications, affiliations, awards. Be specific.
cta_banner (80–100 words): Invite them to work with you. CTA button.`;

    case 'contact':
      return `contact_hero (80–100 words): H1. What happens when you contact us (fast response, no pressure, etc.).
contact_form (60–80 words): Description of what info to provide. Note response time expectation.
contact_info (100–120 words): Phone, email, hours, address (if applicable). Multiple contact options.
service_areas_map (100–130 words): List all areas served. Note max service radius or travel time.
faq_snippet (answer the 3 FAQ questions): <dl> format.`;

    default:
      return `Write each section with 150–250 words. Be specific, detailed, and authoritative. Every claim should be concrete and credible.`;
  }
}

// ─── Image Placeholder Injection ─────────────────────────────────────────────

function injectImagePlaceholders(html: string, images: PageImage[]): string {
  if (images.length === 0) return html;

  const heroImg = images.find((i) => i.slot === 'hero');
  const contentImg = images.find((i) => i.slot === 'content_1');

  let result = html;

  // Inject hero image after the opening tag of first section
  if (heroImg) {
    const figureHtml = `\n<figure class="ism-figure ism-figure--hero"><img src="[ISM_IMAGE:hero]" alt="${escapeAttr(heroImg.alt)}" loading="eager" width="1200" height="630"></figure>\n`;
    result = result.replace(/(<section[^>]*>)/, `$1${figureHtml}`);
  }

  // Inject content image after the second section
  if (contentImg) {
    const figureHtml = `\n<figure class="ism-figure ism-figure--content"><img src="[ISM_IMAGE:content_1]" alt="${escapeAttr(contentImg.alt)}" loading="lazy" width="900" height="600"></figure>\n`;
    // Insert after the second closing </section> tag
    let count = 0;
    result = result.replace(/<\/section>/gi, (match) => {
      count++;
      return count === 2 ? `${match}${figureHtml}` : match;
    });
  }

  return result;
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractCityFromSlug(slug: string): string | undefined {
  const parts = slug.split('/').filter(Boolean);
  if (parts.length < 2) return undefined;
  const last = parts[parts.length - 1];
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanHtml(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```html?\s*/i, '').replace(/```\s*$/, '').trim();
  return cleaned;
}
