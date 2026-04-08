import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
export const runtime = "nodejs";

const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
].filter((key): key is string => !!key);

const TEST_TIMEOUT_MS = 10000;

type KeyTestResult = {
    keySuffix: string;
    valid: boolean;
    error?: string;
    details?: string;
    httpStatus?: number;
};

async function callGeminiWithRetry(apiKey: string, maxRetries: number = 3): Promise<KeyTestResult> {
    const keySuffix = apiKey.slice(-4);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const genAI = new GoogleGenAI({ apiKey });
            const timeoutPromise = new Promise<never>((_, reject) => {
                const id = setTimeout(() => {
                    clearTimeout(id);
                    reject(new Error('Request timed out'));
                }, TEST_TIMEOUT_MS);
            });

            const generatePromise = genAI.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Reply with exactly the word "OK". Do not add anything else.' }],
                }],
                config: { maxOutputTokens: 10, temperature: 0 },
            });

            const response = await Promise.race([generatePromise, timeoutPromise]);
            const text =
                response.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (text.trim().toUpperCase() === 'OK') {
                return { keySuffix, valid: true };
            } else {
                return {
                    keySuffix,
                    valid: false,
                    error: 'Unexpected response',
                    details: text.substring(0, 100),
                };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error?.message || String(error);
            const status = error?.status || error?.code;
            const isRateLimit =
                errorMessage.includes('429') ||
                status === 429 ||
                errorMessage.includes('RESOURCE_EXHAUSTED');

            if (isRateLimit && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                console.warn(`Key ${keySuffix} rate limited, retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            const isQuotaError = isRateLimit || errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('RESOURCE_EXHAUSTED');
            const isDailyQuota = errorMessage.includes('daily') || errorMessage.includes('per day');
            let errorType = 'API call failed';
            if (isQuotaError) {
                errorType = isDailyQuota ? 'Daily quota exhausted' : 'Rate limited (per-minute)';
            }

            console.error(`Key ${keySuffix} error:`, { message: errorMessage, status });
            return {
                keySuffix,
                valid: false,
                error: errorType,
                details: errorMessage.substring(0, 200),
                httpStatus: status,
            };
        }
    }

    return {
        keySuffix,
        valid: false,
        error: 'Max retries exceeded',
        details: 'Failed after multiple retry attempts due to rate limiting.',
    };
}

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.TEST_API_SECRET;
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (apiKeys.length === 0) {
        return NextResponse.json(
            { error: 'No API keys configured in environment variables' },
            { status: 500 }
        );
    }

    // Call the single key with retry logic
    const result = await callGeminiWithRetry(apiKeys[0]);

    return NextResponse.json({
        total: apiKeys.length,
        valid: result.valid ? 1 : 0,
        invalid: result.valid ? 0 : 1,
        results: [result],
        summary: {
            workingKeys: result.valid ? [result.keySuffix] : [],
            failedKeys: result.valid ? [] : [`${result.keySuffix} (${result.error})`],
        },
        note: 'The free tier has strict per-minute (RPM) and per-day (RPD) limits. This implementation includes exponential backoff to handle rate limits automatically.',
    });
}