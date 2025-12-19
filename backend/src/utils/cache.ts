/**
 * Simple in-memory cache utility
 * For production, consider using Redis for distributed caching
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class CacheService {
    private cache: Map<string, CacheEntry<any>>;

    constructor() {
        this.cache = new Map();
    }

    /**
     * Get cached data
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if cache has expired
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cache data
     * @param key Cache key
     * @param data Data to cache
     * @param ttl Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Delete cached data
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Clean expired entries
     */
    cleanExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Export singleton instance
export const cache = new CacheService();

// Clean expired entries every 10 minutes
setInterval(() => {
    cache.cleanExpired();
}, 10 * 60 * 1000);

export default cache;
