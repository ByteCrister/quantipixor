import { Redis } from "@upstash/redis";

/**
 * Global Redis instance to prevent multiple connections in development
 * (Next.js hot reload would otherwise create new connections)
 */
declare global {
    var _redis: Redis | undefined;
}

/** Validate required environment variables */
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
        "Missing Upstash Redis configuration. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
    );
}

/**
 * Singleton Redis client instance
 * Reuses existing connection in development to avoid exhaustion
 */
export const redis: Redis =
    global._redis ??
    new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

if (process.env.NODE_ENV !== "production") {
    global._redis = redis;
}