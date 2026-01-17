/**
 * Simple in-memory rate limiter for Next.js Middleware.
 *
 * Note: In a serverless environment (like Vercel), this in-memory cache
 * is not shared across all lambda instances. For strict global rate limiting
 * in serverless, use an external store like Redis (e.g., Upstash).
 */

interface RateLimitConfig {
  uniqueTokenPerInterval?: number; // Max number of unique IPs to track (LRU-like safety)
  interval?: number; // Window size in ms
}

interface RateLimitOptions {
  limit: number; // Max requests per window
  interval: number; // Window size in ms
}

// Global cache to store hit counts
// Key: "namespace:ip" -> Value: { count, resetTime }
const tracker = new Map<string, { count: number; resetTime: number }>();

// Cleanup interval to prevent memory leaks (runs every minute)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        tracker.forEach((value, key) => {
            if (value.resetTime < now) {
                tracker.delete(key);
            }
        });
    }, 60 * 1000).unref?.(); // .unref() checks if environment supports it (Node.js)
}

/**
 * Checks if a request has exceeded the rate limit.
 *
 * @param ip - The IP address or unique identifier of the client
 * @param namespace - A unique string to identify the rate limit bucket (e.g., "global", "login")
 * @param options - Configuration for the limit (max requests and window size)
 * @returns Object indicating success and headers
 */
export function checkRateLimit(ip: string, namespace: string, options: RateLimitOptions) {
  const now = Date.now();
  const key = `${namespace}:${ip}`;

  const record = tracker.get(key);

  // If no record exists or it has expired, start a new window
  if (!record || record.resetTime < now) {
    tracker.set(key, {
      count: 1,
      resetTime: now + options.interval,
    });
    return { success: true, limit: options.limit, remaining: options.limit - 1, reset: now + options.interval };
  }

  // If record exists and is valid
  if (record.count >= options.limit) {
    return { success: false, limit: options.limit, remaining: 0, reset: record.resetTime };
  }

  // Increment count
  record.count += 1;
  // We don't update resetTime for Fixed Window
  tracker.set(key, record);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: record.resetTime
  };
}
