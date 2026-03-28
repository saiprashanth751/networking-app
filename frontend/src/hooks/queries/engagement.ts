import { engagementService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

// ============================================================================
// COMMENTS
// ============================================================================

export const usePostComments = (
    postId: string,
    params?: { page?: number; limit?: number; sort?: string },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.comments.byPost(postId, params),
        queryFn: () => engagementService.getPostComments(postId, params),
        enabled: !!postId,
        ...options,
    });
};

// Infinite scrolling comments hook
export const useInfiniteComments = (
    postId: string,
    options?: Omit<UseInfiniteQueryOptions<any, Error>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) => {
    return useInfiniteQuery({
        queryKey: queryKeys.comments.byPost(postId),
        queryFn: async ({ pageParam = 1 }) => {
            const page = typeof pageParam === 'number' ? pageParam : 1;
            return engagementService.getPostComments(postId, { page, limit: 20 });
        },
        initialPageParam: 1 as number,
        getNextPageParam: (lastPage: any) => {
            if (lastPage.pagination) {
                const { page, totalPages } = lastPage.pagination;
                return page < totalPages ? page + 1 : undefined;
            }
            return undefined;
        },
        enabled: !!postId,
        staleTime: 30 * 1000, // Comments fresh for 30 seconds
        ...options,
    });
};

export const useCommentReplies = (
    commentId: string,
    params?: { page?: number; limit?: number },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.comments.replies(commentId, params),
        queryFn: () => engagementService.getCommentReplies(commentId, params),
        enabled: !!commentId,
        ...options,
    });
};

export const usePostLikes = (
    postId: string,
    params?: { page?: number; limit?: number },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: [...queryKeys.posts.detail(postId), 'likes', params] as const,
        queryFn: () => engagementService.getPostLikes(postId, params),
        enabled: !!postId,
        ...options,
    });
};

// ============================================================================
// BOOKMARKS
// ============================================================================

export const useUserBookmarks = (
    params?: { page?: number; limit?: number; collectionId?: string },
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.bookmarks.list(params),
        queryFn: () => engagementService.getUserBookmarks(params),
        ...options,
    });
};
