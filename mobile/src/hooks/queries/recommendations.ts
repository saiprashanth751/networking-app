import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { recommendationService, RecommendedUser } from '@/api/recommendations';

/**
 * Hook to fetch recommended users
 * @param limit Number of recommendations to fetch (default 5, max 20)
 * @param options React Query options
 */
export const useRecommendedUsers = (
    limit: number = 5,
    options?: Omit<UseQueryOptions<{ users: RecommendedUser[] }, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['recommendations', limit],
        queryFn: () => recommendationService.getRecommendedUsers(limit),
        staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache for 10 minutes
        ...options,
    });
};
