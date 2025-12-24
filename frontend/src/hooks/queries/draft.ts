import { draftService } from '@/api/post';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useUserDrafts = (
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.drafts.list(),
        queryFn: () => draftService.getUserDrafts(),
        ...options,
    });
};

export const useDraft = (
    draftId: string,
    options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.drafts.detail(draftId),
        queryFn: () => draftService.getDraft(draftId),
        enabled: !!draftId,
        ...options,
    });
};
