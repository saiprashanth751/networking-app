import { categoryService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// ============================================================================
// CATEGORIES
// ============================================================================

export const useCategories = (
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: () => categoryService.getAllCategories(),
        staleTime: 10 * 60 * 1000, // Categories considered fresh for 10 minutes
        ...options,
    });
};

export const useCategoryBySlug = (
    slug: string,
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.categories.detail(slug),
        queryFn: () => categoryService.getCategoryBySlug(slug),
        enabled: !!slug,
        ...options,
    });
};

export const usePostsByCategory = (
    slug: string,
    params?: { page?: number; limit?: number },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.categories.posts(slug, params),
        queryFn: () => categoryService.getPostsByCategory(slug, params),
        enabled: !!slug,
        ...options,
    });
};
