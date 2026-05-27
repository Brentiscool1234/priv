"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiLimiter = exports.ConcurrencyLimiter = void 0;
exports.getOpenAIClient = getOpenAIClient;
exports.chatCompletion = chatCompletion;
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("./logger");
let _client = null;
function getOpenAIClient() {
    if (_client)
        return _client;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _client = new openai_1.default({ apiKey });
    return _client;
}
/**
 * Simple concurrency limiter for OpenAI calls.
 * Maintains at most `limit` concurrent in-flight promises.
 */
class ConcurrencyLimiter {
    constructor(limit = 5) {
        this.limit = limit;
        this.running = 0;
        this.queue = [];
    }
    async run(fn) {
        await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
    acquire() {
        if (this.running < this.limit) {
            this.running++;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }
    release() {
        const next = this.queue.shift();
        if (next) {
            next();
        }
        else {
            this.running--;
        }
    }
}
exports.ConcurrencyLimiter = ConcurrencyLimiter;
exports.openaiLimiter = new ConcurrencyLimiter(5);
/**
 * Call the OpenAI chat completions API with retry on rate-limit errors.
 */
async function chatCompletion(messages, options = {}) {
    const client = getOpenAIClient();
    const attempt = async () => {
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
        }
        catch (err) {
            const isRateLimit = err instanceof Error && err.message.toLowerCase().includes('rate limit');
            if (isRateLimit && i < 2) {
                const delay = (i + 1) * 5000;
                logger_1.logger.warn(`OpenAI rate limit hit, retrying in ${delay}ms`);
                await new Promise((r) => setTimeout(r, delay));
            }
            else {
                throw err;
            }
        }
    }
    throw new Error('OpenAI call failed after retries');
}
//# sourceMappingURL=openai.js.map