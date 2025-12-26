/**
 * Default React Query configurations for different query types
 * 
 * Usage:
 * useQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   ...queryDefaults.list,
 * });
 */

export const queryDefaults = {
    /**
     * For list queries (posts feed, projects list, users list)
     * - Moderate caching
     * - Auto-refetch on focus/reconnect
     * - Retry on network errors
     */
    list: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
        retry: 2, // Retry failed queries twice
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    },

    /**
     * For detail queries (single post, user profile, project detail)
     * - Longer caching (details change less frequently)
     * - Auto-refetch on focus/reconnect
     */
    detail: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    },

    /**
     * For real-time data (notifications, messages, online status)
     * - Short caching
     * - Frequent refetching
     * - More aggressive retries
     */
    realtime: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
        retry: 3, // Retry 3 times for critical real-time data
        retryDelay: 1000, // Fixed 1 second delay
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 60 * 1000, // Refetch every minute
    },

    /**
     * For search/autocomplete queries
     * - Very short caching
     * - No auto-refetch (user controls via input)
     * - Fewer retries (fast failure for UX)
     */
    search: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        retryDelay: 500, // Quick retry
        refetchOnWindowFocus: false, // User controls via search input
        refetchOnReconnect: false,
    },

    /**
     * For static/rarely changing data (categories, tags, departments)
     * - Long caching
     * - Minimal refetching
     */
    static: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // Static data doesn't change often
        refetchOnReconnect: true,
    },
};

/**
 * Error handler for queries
 * Logs errors for debugging without showing toast (let components decide UX)
 */
export const queryErrorHandler = (error: Error, queryKey: unknown) => {
    console.error(`Query failed [${JSON.stringify(queryKey)}]:`, error);
};

/**
 * Success handler for queries (optional, for debugging)
 */
export const querySuccessHandler = (data: unknown, queryKey: unknown) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Query success [${JSON.stringify(queryKey)}]:`, data);
    }
};
