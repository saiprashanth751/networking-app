import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from '@/api/connection';
import { toast } from 'react-toastify';

// Query Keys
export const connectionKeys = {
    all: ['connections'] as const,
    mutual: (userId: string) => [...connectionKeys.all, 'mutual', userId] as const,
};

/**
 * Hook to fetch mutual connections between current user and target user
 */
export const useMutualConnections = (userId: string, enabled = true) => {
    return useQuery({
        queryKey: connectionKeys.mutual(userId),
        queryFn: () => connectionService.getMutualConnections(userId),
        enabled: enabled && !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes,
    });
};

/**
 * Hook to remove a follower
 */
export const useRemoveFollower = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (followerId: string) => connectionService.removeFollower(followerId),
        onSuccess: () => {
            // Invalidate all follow-related queries for real-time updates
            queryClient.invalidateQueries({ queryKey: ['follow'] });
            toast.success('Follower removed');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to remove follower');
        }
    });
};
