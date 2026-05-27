"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQAChecks = runQAChecks;
function runQAChecks(page, allSlugs, allPages) {
    const results = [];
    const content = page.content_html ?? '';
    const words = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
    // has_h1
    const h1Match = content.match(/<h1[^>]*>/gi);
    results.push(h1Match
        ? { check_name: 'has_h1', status: 'pass' }
        : { check_name: 'has_h1', status: 'fail', message: 'No H1 tag found in content' });
    // single_h1
    if (h1Match) {
        results.push(h1Match.length === 1
            ? { check_name: 'single_h1', status: 'pass' }
            : { check_name: 'single_h1', status: 'fail', message: `Found ${h1Match.length} H1 tags` });
    }
    // has_meta_title
    results.push(page.meta_title
        ? { check_name: 'has_meta_title', status: 'pass' }
        : { check_name: 'has_meta_title', status: 'fail', message: 'Meta title is missing' });
    // meta_title_length
    if (page.meta_title) {
        const len = page.meta_title.length;
        if (len > 60)
            results.push({ check_name: 'meta_title_length', status: 'warn', message: `Meta title is ${len} chars (recommended: ≤60)` });
        else if (len < 30)
            results.push({ check_name: 'meta_title_length', status: 'warn', message: `Meta title is only ${len} chars (recommended: ≥30)` });
        else
            results.push({ check_name: 'meta_title_length', status: 'pass' });
    }
    // has_meta_description
    results.push(page.meta_description
        ? { check_name: 'has_meta_description', status: 'pass' }
        : { check_name: 'has_meta_description', status: 'fail', message: 'Meta description is missing' });
    // meta_description_length
    if (page.meta_description) {
        const len = page.meta_description.length;
        if (len > 160)
            results.push({ check_name: 'meta_description_length', status: 'warn', message: `Meta description is ${len} chars (recommended: ≤160)` });
        else if (len < 120)
            results.push({ check_name: 'meta_description_length', status: 'warn', message: `Meta description is ${len} chars (recommended: ≥120)` });
        else
            results.push({ check_name: 'meta_description_length', status: 'pass' });
    }
    // has_schema
    const schemas = typeof page.schema_json === 'string' ? tryParse(page.schema_json, []) : (page.schema_json ?? []);
    results.push(Array.isArray(schemas) && schemas.length > 0
        ? { check_name: 'has_schema', status: 'pass' }
        : { check_name: 'has_schema', status: 'fail', message: 'No schema JSON-LD found' });
    // faq_schema_valid
    const faqSchema = Array.isArray(schemas) ? schemas.find((s) => s['@type'] === 'FAQPage') : null;
    if (faqSchema) {
        const valid = Array.isArray(faqSchema.mainEntity) && faqSchema.mainEntity.length > 0;
        results.push(valid
            ? { check_name: 'faq_schema_valid', status: 'pass' }
            : { check_name: 'faq_schema_valid', status: 'warn', message: 'FAQPage schema found but mainEntity is empty' });
    }
    // has_cta
    const hasCta = content.toLowerCase().includes('irents-cta') || content.toLowerCase().includes('cta-button');
    results.push(hasCta
        ? { check_name: 'has_cta', status: 'pass' }
        : { check_name: 'has_cta', status: 'warn', message: 'No CTA section detected in content' });
    // content_length_ok
    results.push(words.length >= 400
        ? { check_name: 'content_length_ok', status: 'pass' }
        : words.length >= 200
            ? { check_name: 'content_length_ok', status: 'warn', message: `Content is ${words.length} words (recommended: ≥400)` }
            : { check_name: 'content_length_ok', status: 'fail', message: `Content is only ${words.length} words (minimum: 200)` });
    // no_duplicate_title (across project)
    const dupTitles = allPages.filter((p) => p.id !== page.id && p.meta_title && p.meta_title === page.meta_title);
    results.push(dupTitles.length === 0
        ? { check_name: 'no_duplicate_title', status: 'pass' }
        : { check_name: 'no_duplicate_title', status: 'fail', message: `Duplicate meta title found on ${dupTitles.length} other page(s)` });
    // no_duplicate_h1
    const pageH1 = page.h1;
    if (pageH1) {
        const dupH1 = allPages.filter((p) => p.id !== page.id && p.h1 === pageH1);
        results.push(dupH1.length === 0
            ? { check_name: 'no_duplicate_h1', status: 'pass' }
            : { check_name: 'no_duplicate_h1', status: 'fail', message: `Duplicate H1 found on ${dupH1.length} other page(s)` });
    }
    // images_have_alt
    const imgTags = content.match(/<img[^>]+>/gi) ?? [];
    const imgsWithoutAlt = imgTags.filter((img) => !img.includes('alt='));
    if (imgTags.length > 0) {
        results.push(imgsWithoutAlt.length === 0
            ? { check_name: 'images_have_alt', status: 'pass' }
            : { check_name: 'images_have_alt', status: 'fail', message: `${imgsWithoutAlt.length} image(s) missing alt text` });
    }
    // in_sitemap (we check if slug is in our allSlugs - here allSlugs = deployed slugs)
    results.push(allSlugs.includes(page.slug)
        ? { check_name: 'in_sitemap', status: 'pass' }
        : { check_name: 'in_sitemap', status: 'warn', message: 'Page slug not found in project page list' });
    // not_noindex
    const hasNoindex = content.toLowerCase().includes('noindex');
    results.push(!hasNoindex
        ? { check_name: 'not_noindex', status: 'pass' }
        : { check_name: 'not_noindex', status: 'fail', message: 'Page content contains noindex directive' });
    // slug_format
    const slugOk = /^[a-z0-9][a-z0-9/-]*[a-z0-9]$/.test(page.slug) || page.slug === '';
    results.push(slugOk
        ? { check_name: 'slug_format', status: 'pass' }
        : { check_name: 'slug_format', status: 'warn', message: `Slug "${page.slug}" may have formatting issues` });
    return results;
}
function tryParse(val, fallback) {
    try {
        return val ? JSON.parse(val) : fallback;
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=checks.js.map