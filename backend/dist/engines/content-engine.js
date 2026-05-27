"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePageContent = generatePageContent;
exports.generateBatch = generateBatch;
const openai_1 = require("../lib/openai");
const locales_1 = require("../lib/locales");
const logger_1 = require("../lib/logger");
/**
 * Generate HTML content for a single page brief using OpenAI.
 */
async function generatePageContent(brief, businessProfile, locale) {
    const systemPrompt = buildSystemPrompt(businessProfile, locale);
    const userPrompt = buildUserPrompt(brief, businessProfile, locale);
    const raw = await (0, openai_1.chatCompletion)([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ], { temperature: 0.72, max_tokens: 4096 });
    return cleanHtml(raw);
}
/**
 * Generate content for multiple briefs with rate limiting (max 5 concurrent).
 */
async function generateBatch(briefs, businessProfile, localeCode) {
    const locale = (0, locales_1.getLocaleConfig)(localeCode);
    const results = [];
    const tasks = briefs.map((brief) => openai_1.openaiLimiter.run(async () => {
        try {
            logger_1.logger.info(`Generating content for brief ${brief.id} (${brief.slug})`);
            const content_html = await generatePageContent(brief, businessProfile, locale);
            return { brief_id: brief.id, content_html, success: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.logger.error(`Content generation failed for brief ${brief.id}: ${message}`);
            return { brief_id: brief.id, content_html: '', success: false, error: message };
        }
    }));
    const settled = await Promise.allSettled(tasks);
    for (const res of settled) {
        if (res.status === 'fulfilled') {
            results.push(res.value);
        }
        else {
            results.push({
                brief_id: 'unknown',
                content_html: '',
                success: false,
                error: String(res.reason),
            });
        }
    }
    return results;
}
// ─── Prompt Builders ─────────────────────────────────────────────────────────
function buildSystemPrompt(profile, locale) {
    const trustPoints = profile.trust_points?.length
        ? profile.trust_points.join(', ')
        : 'quality service, professional team, customer satisfaction';
    const tone = profile.tone ?? 'professional yet approachable';
    const target = profile.target_customer ?? 'homeowners and businesses';
    return `You are an expert SEO copywriter writing content for ${profile.business_name ?? 'a local business'}.

LANGUAGE: Write exclusively in ${locale.name}. Do NOT translate from English — write naturally as a native speaker.
FORMALITY: ${locale.formality}
TONE: ${tone}
TARGET CUSTOMER: ${target}
TRUST POINTS: ${trustPoints}
CTA STYLE: ${locale.cta_style}

CONTENT RULES:
- Write each section as a self-contained HTML block (<section>, <div>, <h2>, <p>, <ul>, etc.)
- Use the exact primary keyword naturally in H1, first paragraph, and 2-3 times throughout
- Do NOT keyword-stuff — density should feel natural
- Avoid generic AI phrases like "In today's world", "Look no further", "At [company]"
- Each section should have a clear heading (H2 or H3) matching the section name
- Include the CTA "${locale.cta_style}" as a visible call-to-action button or prominent text
- Write minimum 400 words total across all sections
- Do not include <html>, <head>, or <body> tags — only the inner section HTML
- Return ONLY valid HTML, no markdown, no explanatory text before or after`;
}
function buildUserPrompt(brief, profile, locale) {
    const sections = brief.section_structure.join(', ');
    const faqs = brief.faq_questions.length
        ? brief.faq_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
        : 'No FAQs required';
    const secondaryKws = brief.secondary_keywords.length > 0
        ? brief.secondary_keywords.join(', ')
        : 'none';
    return `Write a complete ${brief.page_type.replace('_', ' ')} page for ${profile.business_name ?? 'our business'}.

PAGE DETAILS:
- H1: ${brief.h1 ?? brief.primary_keyword}
- Primary keyword: ${brief.primary_keyword}
- Secondary keywords: ${secondaryKws}
- Meta description (for context): ${brief.meta_description ?? ''}
- CTA angle: ${brief.cta_angle ?? locale.cta_style}

REQUIRED SECTIONS (in order):
${sections}

FAQ QUESTIONS TO ANSWER (include in faq section if present):
${faqs}

Write each section as an HTML block. The faq section must use a definition-list or question/answer structure.
Include at least one CTA button: <a href="/contact" class="cta-button">${locale.cta_style}</a>`;
}
/**
 * Strips markdown code fences and trims output, ensuring we have clean HTML.
 */
function cleanHtml(raw) {
    let cleaned = raw.trim();
    // Remove ```html or ``` wrappers if present
    cleaned = cleaned.replace(/^```html?\s*/i, '').replace(/```\s*$/, '').trim();
    return cleaned;
}
//# sourceMappingURL=content-engine.js.map