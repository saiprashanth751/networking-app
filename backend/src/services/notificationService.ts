import prisma from '../../prisma/prisma_client';
import { Notification, NotificationType, NotificationPreference } from '@prisma/client';

export interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actorId?: string;
    entityId?: string;
    entityType?: string;
    data?: any;
}

export interface GetNotificationsOptions {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unread: number;
}

class NotificationService {
    /**
     * Create a new notification
     * Checks user preferences before creating
     */
    async create(params: CreateNotificationParams): Promise<Notification | null> {
        // Check if user wants this type of notification
        const shouldNotify = await this.shouldNotify(params.userId, params.type);
        if (!shouldNotify) {
            return null;
        }

        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                actorId: params.actorId,
                entityId: params.entityId,
                entityType: params.entityType,
                data: params.data,
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: { profilePic: true }
                        }
                    }
                }
            }
        });

        return notification;
    }

    /**
     * Get notifications for a user with pagination and filtering
     */
    async getForUser(userId: string, options: GetNotificationsOptions = {}): Promise<NotificationsResponse> {
        const {
            limit = 20,
            offset = 0,
            unreadOnly = false,
            type
        } = options;

        // Build where clause
        const where: any = { userId };
        if (unreadOnly) {
            where.read = false;
        }
        if (type) {
            where.type = type;
        }

        // Get notifications
        const [notifications, total, unread] = await Promise.all([
            prisma.notification.findMany({
                where,
                include: {
                    actor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profile: {
                                select: { profilePic: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, read: false } })
        ]);

        return {
            notifications,
            total,
            unread
        };
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true, seen: true }
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, seen: true }
        });
    }

    /**
     * Mark notification as seen (viewed in dropdown, but not clicked)
     */
    async markAsSeen(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { seen: true }
        });
    }

    /**
     * Delete a notification
     */
    async delete(notificationId: string): Promise<void> {
        await prisma.notification.delete({
            where: { id: notificationId }
        });
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: { userId, read: false }
        });
    }

    /**
     * Get user's notification preferences
     * Creates default preferences if they don't exist
     */
    async getPreferences(userId: string): Promise<NotificationPreference> {
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId }
        });

        // Create default preferences if not found
        if (!preferences) {
            preferences = await prisma.notificationPreference.create({
                data: { userId }
            });
        }

        return preferences;
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(
        userId: string,
        updates: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<NotificationPreference> {
        // Ensure preferences exist
        await this.getPreferences(userId);

        return await prisma.notificationPreference.update({
            where: { userId },
            data: updates
        });
    }

    /**
     * Check if user should receive a notification of this type
     * Based on their preferences
     */
    async shouldNotify(userId: string, type: NotificationType): Promise<boolean> {
        const preferences = await this.getPreferences(userId);

        const typeToPreferenceMap: Record<NotificationType, keyof NotificationPreference> = {
            NEW_FOLLOWER: 'newFollower',
            POST_LIKE: 'postLike',
            POST_COMMENT: 'postComment',
            COMMENT_REPLY: 'commentReply',
            POST_SHARE: 'postShare',
            MENTION: 'mention',
            MESSAGE: 'message',
            CALL_MISSED: 'callMissed',
            PROJECT_COLLABORATION: 'newFollower', // Default to true, no specific preference yet
        };

        const preferenceKey = typeToPreferenceMap[type];
        return preferences[preferenceKey] as boolean ?? true;
    }

    /**
     * Bulk mark notifications as seen (for when dropdown is opened)
     */
    async markManyAsSeen(userId: string, notificationIds: string[]): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                userId,
                id: { in: notificationIds },
                seen: false
            },
            data: { seen: true }
        });
    }
}

export const notificationService = new NotificationService();
