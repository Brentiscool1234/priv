import OpenAI from 'openai';
import { logger } from './logger';

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Simple concurrency limiter for OpenAI calls.
 * Maintains at most `limit` concurrent in-flight promises.
 */
export class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly limit: number = 5) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.running--;
    }
  }
}

export const openaiLimiter = new ConcurrencyLimiter(5);

/**
 * Call the OpenAI chat completions API with retry on rate-limit errors.
 */
export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: Partial<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming> = {}
): Promise<string> {
  const client = getOpenAIClient();

  const attempt = async (): Promise<string> => {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 4096,
      ...options,
      messages,
    });
    return res.choices[0]?.message?.content ?? '';
  };

  // Simple retry with backoff for rate-limit errors
  for (let i = 0; i < 3; i++) {
    try {
      return await attempt();
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error && err.message.toLowerCase().includes('rate limit');
      if (isRateLimit && i < 2) {
        const delay = (i + 1) * 5000;
        logger.warn(`OpenAI rate limit hit, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }

  throw new Error('OpenAI call failed after retries');
}
