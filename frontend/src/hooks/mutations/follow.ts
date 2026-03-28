import { followService } from "@/api/follow";
import { queryKeys } from "@/lib/queryClient";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";


export const useFollowUser = (
  options?: UseMutationOptions<void, Error, string, { previousStatus: unknown; userId: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followService.followUser,
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.follow.status(userId) });

      // Snapshot previous value
      const previousStatus = queryClient.getQueryData(queryKeys.follow.status(userId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.follow.status(userId), { following: true });

      // Return context with previous value
      return { previousStatus, userId };
    },
    onError: (_err, userId, context) => { // _err prefixed to silence unused var warning
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.follow.status(userId),
          context.previousStatus
        );
      }
      toast.error('Failed to follow user');
    },
    onSuccess: (_, userId) => {
      // Invalidate follow-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.followers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.following() });
      // Invalidate recommendations (followed users should be removed)
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onSettled: (_, __, userId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(userId) });
    },
    ...options,
  });
};

export const useUnfollowUser = (
  options?: UseMutationOptions<void, Error, string, { previousStatus: unknown; userId: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followService.unfollowUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.follow.status(userId) });

      const previousStatus = queryClient.getQueryData(queryKeys.follow.status(userId));

      queryClient.setQueryData(queryKeys.follow.status(userId), { following: false });

      return { previousStatus, userId };
    },
    onError: (_err, userId, context) => { // _err prefixed to silence unused var warning
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.follow.status(userId),
          context.previousStatus
        );
      }
      toast.error('Failed to unfollow user');
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.followers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.following() });
      // Invalidate recommendations (unfollowed users may appear again)
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onSettled: (_, __, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(userId) });
    },
    ...options,
  });
};

export const useToggleFollow = (userId: string, isCurrentlyFollowing: boolean) => {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const toggleFollow = () => {
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return {
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};