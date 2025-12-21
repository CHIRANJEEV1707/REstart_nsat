"use strict";
/**
 * Simple in-memory cache utility
 * For production, consider using Redis for distributed caching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
class CacheService {
    constructor() {
        this.cache = new Map();
    }
    /**
     * Get cached data
     */
    get(key) {
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
        return entry.data;
    }
    /**
     * Set cache data
     * @param key Cache key
     * @param data Data to cache
     * @param ttl Time to live in milliseconds (default: 5 minutes)
     */
    set(key, data, ttl = 5 * 60 * 1000) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    /**
     * Delete cached data
     */
    delete(key) {
        this.cache.delete(key);
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
    /**
     * Clean expired entries
     */
    cleanExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
// Export singleton instance
exports.cache = new CacheService();
// Clean expired entries every 10 minutes
setInterval(() => {
    exports.cache.cleanExpired();
}, 10 * 60 * 1000);
exports.default = exports.cache;
