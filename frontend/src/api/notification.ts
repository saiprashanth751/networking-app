import { apiClient } from '../lib/apiClient';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    actorId?: string | null;
    actor?: {
        id: string;
        firstName: string;
        lastName: string | null;
        profile?: {
            profilePic?: string | null;
        } | null;
    } | null;
    entityId?: string | null;
    entityType?: string | null;
    read: boolean;
    seen: boolean;
    data?: any;
    createdAt: string;
}

export interface NotificationPreference {
    id: string;
    userId: string;
    newFollower: boolean;
    postLike: boolean;
    postComment: boolean;
    commentReply: boolean;
    postShare: boolean;
    mention: boolean;
    message: boolean;
    callMissed: boolean;
    emailEnabled: boolean;
    soundEnabled: boolean;
    desktopEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetNotificationsParams {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unread: number;
}

export const notificationService = {
    /**
     * Get notifications with pagination and filtering
     */
    getNotifications: async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
        const response = await apiClient.get('/notification', { params });
        return response.data;
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<{ unread: number }> => {
        const response = await apiClient.get('/notification/unread');
        return response.data;
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        await apiClient.post(`/notification/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<void> => {
        await apiClient.post('/notification/read-all');
    },

    /**
     * Mark notification as seen
     */
    markAsSeen: async (notificationId: string): Promise<void> => {
        await apiClient.post(`/notification/${notificationId}/seen`);
    },

    /**
     * Delete notification
     */
    deleteNotification: async (notificationId: string): Promise<void> => {
        await apiClient.delete(`/notification/${notificationId}`);
    },

    /**
     * Get notification preferences
     */
    getPreferences: async (): Promise<NotificationPreference> => {
        const response = await apiClient.get('/notification/preferences');
        return response.data;
    },

    /**
     * Update notification preferences
     */
    updatePreferences: async (updates: Partial<NotificationPreference>): Promise<NotificationPreference> => {
        const response = await apiClient.put('/notification/preferences', updates);
        return response.data.preferences;
    },
};
