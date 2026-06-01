import { getOpenAIClient, openaiLimiter } from '../lib/openai';
import { logger } from '../lib/logger';
import type { PageBrief, BusinessProfile, PageImage } from '../types';

// Limit concurrent DALL-E calls to avoid rate limits
const imageLimiter = { run: <T>(fn: () => Promise<T>) => openaiLimiter.run(fn) };

export async function generatePageImages(
  brief: PageBrief,
  profile: BusinessProfile
): Promise<PageImage[]> {
  if (process.env.GENERATE_IMAGES === 'false') return [];

  const images: PageImage[] = [];
  const needsContent = brief.page_type === 'service' || brief.page_type === 'service_location';

  const [hero, content] = await Promise.all([
    imageLimiter.run(() => generateImage('hero', brief, profile)),
    needsContent
      ? imageLimiter.run(() => generateImage('content_1', brief, profile))
      : Promise.resolve(null),
  ]);

  if (hero) images.push(hero);
  if (content) images.push(content);
  return images;
}

async function generateImage(
  slot: PageImage['slot'],
  brief: PageBrief,
  profile: BusinessProfile
): Promise<PageImage | null> {
  const client = getOpenAIClient();
  const prompt = buildPrompt(slot, brief, profile);
  const alt = buildAlt(slot, brief, profile);

  try {
    logger.info(`Generating ${slot} image for ${brief.slug}`);
    const res = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: slot === 'hero' ? '1792x1024' : '1024x1024',
      response_format: 'b64_json',
      quality: 'standard',
    });

    const data_b64 = res.data?.[0]?.b64_json;
    if (!data_b64) throw new Error('No image data returned');

    logger.info(`Generated ${slot} image for ${brief.slug}`);
    return { slot, alt, prompt, data_b64 };
  } catch (err) {
    logger.warn(`Image generation failed (${slot}) for ${brief.slug}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

function buildPrompt(slot: PageImage['slot'], brief: PageBrief, profile: BusinessProfile): string {
  const biz = profile.business_name ?? 'local service business';
  const svc = brief.primary_keyword ?? brief.h1 ?? 'professional service';
  const city = extractCity(brief.slug);
  const industry = (profile.data?.industry as string ?? '').replace(/_/g, ' ');

  if (slot === 'hero') {
    switch (brief.page_type) {
      case 'service_location':
        return `Professional commercial photograph of a ${svc} team at work${city ? ` in ${city}` : ''}. Uniformed professionals using proper equipment. Bright natural lighting, sharp focus, wide angle composition suitable for a website hero banner. Clean, modern, trustworthy. No text, no watermarks, no logos.`;
      case 'service':
        return `Professional commercial photograph of ${svc} work in progress. Shows skilled technicians with proper tools and equipment. High quality, clean composition, suitable for a business website hero. Bright, well-lit, no text, no watermarks.`;
      case 'location':
        return `Professional aerial or street-level photograph of ${city || 'a residential neighborhood'}. Clean, bright, well-composed. Shows residential or commercial area with clear skies. Suitable for a local service company website hero. No text, no watermarks.`;
      case 'homepage':
        return `Professional team photo of a ${industry || 'service'} company. Uniformed staff with branded vehicles or equipment, looking confident and professional. Clean, bright, modern commercial photography style. No text, no watermarks.`;
      case 'about':
        return `Professional team portrait of a ${industry || 'service'} company team. Group of uniformed professionals standing together, smiling, in front of their vehicles or office. Clean background, good lighting, trustworthy appearance. No text, no watermarks.`;
      default:
        return `Professional commercial photograph related to ${svc} services. Clean, high quality, modern. Suitable for a business website. No text, no watermarks.`;
    }
  }

  // content_1 or content_2 — detailed service shots
  return `Close-up commercial photograph showing high-quality ${svc} work result or process. Detail shot showing professional craftsmanship and attention to detail. Clean background, sharp focus, bright professional lighting. No people, no text, no watermarks.`;
}

function buildAlt(slot: PageImage['slot'], brief: PageBrief, profile: BusinessProfile): string {
  const biz = profile.business_name ?? 'Professional team';
  const city = extractCity(brief.slug);
  if (slot === 'hero') {
    return `${biz} — ${brief.h1 ?? brief.primary_keyword}${city ? ` in ${city}` : ''}`;
  }
  return `${brief.primary_keyword ?? 'Professional service'} by ${biz} — quality workmanship`;
}

function extractCity(slug: string): string {
  const parts = slug.split('/').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
