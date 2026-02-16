// Call History React Query Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callHistoryService } from '@/api/callHistory';
import { toast } from 'react-toastify';

// Get all call history
export const useCallHistory = () => {
    return useQuery({
        queryKey: ['callHistory'],
        queryFn: callHistoryService.getAll,
        staleTime: 30 * 1000, // 30 seconds
        select: (data) => data.calls || []
    });
};

// Get call history with specific user
export const useUserCallHistory = (userId: string) => {
    return useQuery({
        queryKey: ['callHistory', 'user', userId],
        queryFn: () => callHistoryService.getWithUser(userId),
        staleTime: 30 * 1000,
        enabled: !!userId,
        select: (data) => data.calls || []
    });
};

// Delete call history entry
export const useDeleteCallHistory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: callHistoryService.deleteCall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['callHistory'] });
            toast.success('Call deleted from history');
        },
        onError: () => {
            toast.error('Failed to delete call');
        }
    });
};
