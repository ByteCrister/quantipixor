// ────────────────────────────────────────────────────────────────────────────────
// Uses Redis atomic counters + expiration window
// Supports configurable limits via environment variables
// ────────────────────────────────────────────────────────────────────────────────

import { redis } from "@/config/redis";

type RateLimitType = "minute" | "hour";

/**
 * Safely parse environment variables with fallback
 */
function getEnvNumber(key: string, fallback: number): number {
    const value = process.env[key];
    const parsed = Number(value);

    if (!value || isNaN(parsed) || parsed <= 0) {
        console.warn(`[RateLimit] Invalid or missing env "${key}", using fallback=${fallback}`);
        return fallback;
    }

    return parsed;
}

/**
 * Centralized rate limit configuration (from ENV)
 * This allows dynamic tuning without code changes
 */
const RATE_LIMITS = {
    minute: {
        limit: getEnvNumber("RATE_LIMIT_PER_MINUTE", 2),
        window: getEnvNumber("RATE_LIMIT_WINDOW_MINUTE", 60), // seconds
    },
    hour: {
        limit: getEnvNumber("RATE_LIMIT_PER_HOUR", 5),
        window: getEnvNumber("RATE_LIMIT_WINDOW_HOUR", 3600), // seconds
    },
} as const;

/**
 * Checks whether a user is within the allowed rate limit.
 *
 * ───────────────────────────────────────────────────────────────
 * Strategy:
 * - Uses Redis INCR (atomic) to count requests
 * - First request sets an expiration (window)
 * - Subsequent requests increment counter
 * - If count > limit → blocked
 *
 * ───────────────────────────────────────────────────────────────
 * Key format:
 * diagnosis:v2:ratelimit:{userId}:{type}
 *
 * Example:
 * diagnosis:v2:ratelimit:123:minute
 *
 * ───────────────────────────────────────────────────────────────
 *
 * @param purpose
 * @param userId - Unique identifier for the user (must be stable)
 * @param type - Rate limit bucket ("minute" | "hour")
 *
 * @returns boolean
 *   true  → allowed
 *   false → rate limit exceeded
 */
export async function checkRateLimit(
    purpose: string,
    userId: string,
    type: RateLimitType
): Promise<boolean> {
    if (!userId) {
        throw new Error("[RateLimit] userId is required");
    }

    const config = RATE_LIMITS[type];
    const { limit, window } = config;

    // Redis key for this user + time bucket
    const key = `${purpose}:v2:ratelimit:${userId}:${type}`;

    try {
        // Atomically increment request count
        const current = await redis.incr(key);

        // Set expiration only on first request
        if (current === 1) {
            await redis.expire(key, window);
        }

        // Optional: Debug logging (can be replaced with proper logger)
        // console.log(`[RateLimit] ${key} → ${current}/${limit}`);

        return current <= limit;
    } catch (error) {
        // Fail-open strategy (important for production)
        // If Redis fails, DO NOT block users
        console.error("[RateLimit] Redis error:", error);
        return true;
    }
}