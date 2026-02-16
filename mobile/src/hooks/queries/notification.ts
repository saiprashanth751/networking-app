import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { notificationService, NotificationsResponse, GetNotificationsParams, NotificationPreference } from '@/api/notification';
import { toast } from 'react-toastify';

/**
 * Query key factory for notifications
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    list: (params?: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
    unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
    preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

/**
 * Hook to fetch notifications with pagination
 */
export const useNotifications = (
    params?: GetNotificationsParams,
    options?: Omit<UseQueryOptions<NotificationsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: notificationKeys.list(params),
        queryFn: () => notificationService.getNotifications(params),
        staleTime: 30 * 1000, // 30 seconds (notifications should be fresh)
        gcTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

/**
 * Hook to fetch unread notification count
 */
export const useUnreadCount = (
    options?: Omit<UseQueryOptions<{ unread: number }, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: () => notificationService.getUnreadCount(),
        staleTime: 10 * 1000, // 10 seconds
        gcTime: 60 * 1000, // 1 minute
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
        ...options,
    });
};

/**
 * Hook to mark notification as read
 */
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            // Invalidate notifications and unread count
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success('All notifications marked as read');
        },
    });
};

/**
 * Hook to delete notification
 */
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success('Notification deleted');
        },
    });
};

/**
 * Hook to get notification preferences
 */
export const useNotificationPreferences = (
    options?: Omit<UseQueryOptions<NotificationPreference, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: notificationKeys.preferences(),
        queryFn: () => notificationService.getPreferences(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: Partial<NotificationPreference>) =>
            notificationService.updatePreferences(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
            toast.success('Notification preferences updated');
        },
    });
};
