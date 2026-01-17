import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Ensure environment variables are present or fail specifically in development
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
    }
    // Setup a dummy for build time if needed, but ideally we want to fail if config is missing
}

// Create Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "https://example.upstash.io",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
});

// Create Rate Limiters
// 1. Auth Limiter: Strict (e.g., 5 requests per 10 minutes by IP)
export const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"), 
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
});

// 2. API Limiter: General (e.g., 50 requests per 1 minute by IP)
export const apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 m"), 
    analytics: true,
    prefix: "@upstash/ratelimit/api",
});
