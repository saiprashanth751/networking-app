import NodeCache from 'node-cache';

/**
 * Cache Service using node-cache
 * 
 * Features:
 * - In-memory caching
 * - Automatic expiration (TTL)
 * - Simple key-value storage
 * - Production-ready
 */

// Create cache instance with default TTL of 5 minutes (300 seconds)
const cache = new NodeCache({
    stdTTL: 300, // Default: 5 minutes
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false, // Don't clone values (better performance)
});

export const cacheService = {
    /**
     * Get value from cache
     * @param key Cache key
     * @returns Cached value or undefined
     */
    get: <T>(key: string): T | undefined => {
        return cache.get<T>(key);
    },

    /**
     * Set value in cache
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds (optional, uses default if not provided)
     */
    set: <T>(key: string, value: T, ttl?: number): boolean => {
        return cache.set(key, value, ttl || 300);
    },

    /**
     * Delete value from cache
     * @param key Cache key
     */
    del: (key: string): number => {
        return cache.del(key);
    },

    /**
     * Clear all cache
     */
    flush: (): void => {
        cache.flushAll();
    },

    /**
     * Check if key exists in cache
     * @param key Cache key
     */
    has: (key: string): boolean => {
        return cache.has(key);
    },

    /**
     * Get cache statistics
     */
    getStats: () => {
        return cache.getStats();
    },

    /**
     * Get all keys in cache
     */
    keys: (): string[] => {
        return cache.keys();
    },
};

export default cacheService;
