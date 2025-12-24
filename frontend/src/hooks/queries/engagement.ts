import { engagementService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

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
