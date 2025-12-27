

export const queryDefaults = {
    list: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // Garbage collect after 10 minutes
        retry: 2, // Retry failed queries twice
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    },


    detail: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    },

    realtime: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
        retry: 3, // Retry 3 times for critical real-time data
        retryDelay: 1000, // Fixed 1 second delay
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: 60 * 1000, // Refetch every minute
    },

    search: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        retryDelay: 500, // Quick retry
        refetchOnWindowFocus: false, // User controls via search input
        refetchOnReconnect: false,
    },

    static: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // Static data doesn't change often
        refetchOnReconnect: true,
    },
};

export const queryErrorHandler = (error: Error, queryKey: unknown) => {
    console.error(`Query failed [${JSON.stringify(queryKey)}]:`, error);
};

export const querySuccessHandler = (data: unknown, queryKey: unknown) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Query success [${JSON.stringify(queryKey)}]:`, data);
    }
};
