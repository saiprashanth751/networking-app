import { tagService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useTagSearch = (
    query: string,
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.tags.search(query),
        queryFn: () => tagService.searchTags(query),
        enabled: query.length > 0,
        staleTime: 30 * 1000,
        ...options,
    });
};

export const useTrendingTags = (
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.tags.trending(),
        queryFn: () => tagService.getTrendingTags(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const usePostsByTag = (
    slug: string,
    params?: { page?: number; limit?: number },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.tags.posts(slug, params),
        queryFn: () => tagService.getPostsByTag(slug, params),
        enabled: !!slug,
        ...options,
    });
};
