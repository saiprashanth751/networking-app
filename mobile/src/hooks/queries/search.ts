import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService } from '@/api/search';
import type { SearchType } from '@/types/types';

export const useGlobalSearch = (
    query: string,
    type: SearchType = 'all',
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['search', 'global', query, type],
        queryFn: () => searchService.globalSearch(query, type),
        enabled: enabled && query.length >= 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry cancelled requests (user is still typing)
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                return false;
            }
            // Don't retry auth errors
            if (error.message?.includes('sign in')) {
                return false;
            }
            // Don't retry validation errors
            if (error.message?.includes('Invalid')) {
                return false;
            }
            // Retry network/server errors up to 2 times
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
};

export const useSearchHistory = () => {
    return useQuery({
        queryKey: ['search', 'history'],
        queryFn: searchService.getSearchHistory,
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        retry: 1, // Retry once on failure
    });
};

export const useClearSearchHistory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: searchService.clearSearchHistory,
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['search', 'history'] });

            // Snapshot previous value for rollback
            const previousHistory = queryClient.getQueryData(['search', 'history']);

            // Optimistically update to empty
            queryClient.setQueryData(['search', 'history'], { searches: [] });

            return { previousHistory };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousHistory) {
                queryClient.setQueryData(['search', 'history'], context.previousHistory);
            }
        },
        onSuccess: () => {
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: ['search', 'history'] });
        },
    });
};

export const useDeleteSearchHistoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (searchId: string) => searchService.deleteSearchHistoryItem(searchId),
        onMutate: async (searchId) => {
            await queryClient.cancelQueries({ queryKey: ['search', 'history'] });

            const previousHistory: any = queryClient.getQueryData(['search', 'history']);

            // Optimistically remove item
            if (previousHistory?.searches) {
                queryClient.setQueryData(['search', 'history'], {
                    searches: previousHistory.searches.filter((s: any) => s.id !== searchId),
                });
            }

            return { previousHistory };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousHistory) {
                queryClient.setQueryData(['search', 'history'], context.previousHistory);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'history'] });
        },
    });
};

export const useTrendingTopics = (limit: number = 10, days: number = 7) => {
    return useQuery({
        queryKey: ['trending', 'topics', limit, days],
        queryFn: () => searchService.getTrendingTopics(limit, days),
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes
        retry: 1, // Only retry once since this is not critical
    });
};

export const useTrendingUsers = (limit: number = 5) => {
    return useQuery({
        queryKey: ['trending', 'users', limit],
        queryFn: () => searchService.getTrendingUsers(limit),
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes
        retry: 1,
    });
};
