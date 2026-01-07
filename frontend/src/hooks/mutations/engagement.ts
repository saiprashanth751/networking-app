import { postService, engagementService, draftService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// POST MUTATIONS (Extended)
export const useUpdatePost = (
    options?: UseMutationOptions<any, Error, { postId: string; data: any }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, data }) => postService.updatePost(postId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            toast.success('Post updated successfully!');
        },
        ...options,
    });
};

export const useDeletePost = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => postService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            toast.success('Post deleted successfully!');
        },
        ...options,
    });
};

// ENGAGEMENT MUTATIONS
export const useToggleLike = (
    options?: UseMutationOptions<any, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => engagementService.toggleLike(postId),
        onSuccess: (_, postId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        },
        ...options,
    });
};

export const useAddComment = (
    options?: UseMutationOptions<any, Error, { postId: string; content: string; parentId?: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content, parentId }) =>
            engagementService.addComment(postId, content, parentId),
        onSuccess: (_, variables) => {
            // Refresh comments list (including replies)
            queryClient.invalidateQueries({ queryKey: queryKeys.comments.byPost(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
            // Update post comment count in real-time
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            toast.success('Comment added!');
        },
        ...options,
    });
};

export const useDeleteComment = (
    options?: UseMutationOptions<void, Error, { commentId: string; postId: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId }) => engagementService.deleteComment(commentId),
        onSuccess: (_, variables) => {
            // Refresh comments
            queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
            // Update post comment count in real-time
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            toast.success('Comment deleted!');
        },
        ...options,
    });
};

export const useToggleCommentLike = (
    options?: UseMutationOptions<any, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => engagementService.toggleCommentLike(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
        },
        ...options,
    });
};

export const useToggleBookmark = (
    options?: UseMutationOptions<any, Error, { postId: string; collectionId?: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, collectionId }) =>
            engagementService.toggleBookmark(postId, collectionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
        },
        ...options,
    });
};

export const useRecordShare = (
    options?: UseMutationOptions<any, Error, { postId: string; platform?: string }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, platform }) => engagementService.recordShare(postId, platform),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
        },
        ...options,
    });
};

// DRAFT MUTATIONS
export const useSaveDraft = (
    options?: UseMutationOptions<any, Error, any>
) => {
    return useMutation({
        mutationFn: (draftData: any) => draftService.saveDraft(draftData),
        ...options,
    });
};

export const useDeleteDraft = (
    options?: UseMutationOptions<void, Error, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (draftId: string) => draftService.deleteDraft(draftId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.drafts.all });
            toast.success('Draft deleted!');
        },
        ...options,
    });
};
