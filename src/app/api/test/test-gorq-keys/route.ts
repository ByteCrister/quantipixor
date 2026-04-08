import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// List of Groq API keys to test (from environment variables)
const apiKeys = [process.env.GROQ_API_KEY_1].filter((key): key is string => !!key);
const TEST_TIMEOUT_MS = 10000;

type KeyTestResult = {
    keySuffix: string;
    valid: boolean;
    error?: string;
    details?: string;
    httpStatus?: number;
};

async function callGroqWithRetry(apiKey: string, maxRetries: number = 3): Promise<KeyTestResult> {
    const keySuffix = apiKey.slice(-4);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const groq = new Groq({ apiKey });

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TEST_TIMEOUT_MS)
            );

            // ✅ Updated to a currently supported model
            const chatPromise = groq.chat.completions.create({
                model: 'llama-3.1-8b-instant', // Replacement for decommissioned llama3-8b-8192
                messages: [
                    {
                        role: 'user',
                        content: 'Reply with exactly the word "OK". Do not add anything else.',
                    },
                ],
                max_tokens: 10,
                temperature: 0,
            });

            const response = await Promise.race([chatPromise, timeoutPromise]);
            const text = response.choices[0]?.message?.content || '';

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
            const isRateLimit = errorMessage.includes('429') || status === 429;

            if (isRateLimit && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000;
                console.warn(`Key ${keySuffix} rate limited, retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            const isQuotaError = isRateLimit || errorMessage.includes('quota') || errorMessage.includes('rate limit');
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
            { error: 'No Groq API keys configured in environment variables' },
            { status: 500 }
        );
    }

    const result = await callGroqWithRetry(apiKeys[0]);

    return NextResponse.json({
        total: apiKeys.length,
        valid: result.valid ? 1 : 0,
        invalid: result.valid ? 0 : 1,
        results: [result],
        summary: {
            workingKeys: result.valid ? [result.keySuffix] : [],
            failedKeys: result.valid ? [] : [`${result.keySuffix} (${result.error})`],
        },
        note: 'Groq free tier offers 14,400 requests/day and 7,000 requests/minute. This implementation includes exponential backoff for rate limits.',
    });
}