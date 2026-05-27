import OpenAI from 'openai';
export declare function getOpenAIClient(): OpenAI;
/**
 * Simple concurrency limiter for OpenAI calls.
 * Maintains at most `limit` concurrent in-flight promises.
 */
export declare class ConcurrencyLimiter {
    private readonly limit;
    private running;
    private queue;
    constructor(limit?: number);
    run<T>(fn: () => Promise<T>): Promise<T>;
    private acquire;
    private release;
}
export declare const openaiLimiter: ConcurrencyLimiter;
/**
 * Call the OpenAI chat completions API with retry on rate-limit errors.
 */
export declare function chatCompletion(messages: OpenAI.Chat.ChatCompletionMessageParam[], options?: Partial<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming>): Promise<string>;
//# sourceMappingURL=openai.d.ts.map