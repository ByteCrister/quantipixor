import { redis } from "@/config/redis";
import { NextRequest } from "next/server";

const DEFAULT_LIMIT = 10;
const MAX_USER_LIMIT = parseInt(process.env.PROFILES_MAX_USER_LIMIT || "30", 10);
const MIN_USER_LIMIT = 1;

function getCurrentMinuteTimestamp(): number {
    return Math.floor(Date.now() / 60000);
}

function parseUserLimit(request: NextRequest): number | null {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("maxPerMinute");
    if (!param) return null;

    const limit = parseInt(param, 10);
    if (isNaN(limit)) return null;

    return Math.min(MAX_USER_LIMIT, Math.max(MIN_USER_LIMIT, limit));
}

export async function checkProfileRateLimit(
    request: NextRequest,
    userId: string
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    if (!userId) {
        throw new Error("[ProfileRateLimit] userId is required");
    }

    const minuteTimestamp = getCurrentMinuteTimestamp();
    const counterKey = `profiles:ratelimit:${userId}:${minuteTimestamp}`;
    const limitKey = `profiles:ratelimit:limit:${userId}:${minuteTimestamp}`;
    const ttlSeconds = 60;

    try {
        let limit: number;
        const existingLimitRaw = await redis.get<string>(limitKey);

        if (existingLimitRaw !== null) {
            limit = parseInt(existingLimitRaw, 10);
        } else {
            const userLimit = parseUserLimit(request);
            limit = userLimit !== null ? userLimit : DEFAULT_LIMIT;

            // Upstash Redis: use { ex, nx } (lowercase)
            const setResult = await redis.set(limitKey, limit, {
                ex: ttlSeconds,
                nx: true, // only set if key doesn't exist
            });

            if (setResult === null) {
                // Race condition: another request set it first, fetch again
                const freshRaw = await redis.get<string>(limitKey);
                if (freshRaw !== null) {
                    limit = parseInt(freshRaw, 10);
                }
            }
        }

        // Atomic increment of request counter
        const current = await redis.incr(counterKey);
        if (current === 1) {
            await redis.expire(counterKey, ttlSeconds);
        }

        const allowed = current <= limit;
        const remaining = Math.max(0, limit - current);

        return { allowed, limit, remaining };
    } catch (error) {
        console.error("[ProfileRateLimit] Redis error:", error);
        return { allowed: true, limit: DEFAULT_LIMIT, remaining: DEFAULT_LIMIT };
    }
}