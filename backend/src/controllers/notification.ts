import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { notificationService } from '../services/notificationService';
import { NotificationType } from '@prisma/client';
import prisma from '../../prisma/prisma_client';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
    id?: string;
}

/**
 * Get notifications for authenticated user
 * GET /api/v1/notification
 */
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;
    const { limit, offset, unreadOnly, type } = req.query;

    const result = await notificationService.getForUser(userId, {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        unreadOnly: unreadOnly === 'true',
        type: type as NotificationType,
    });

    res.json(result);
});

/**
 * Get unread count
 * GET /api/v1/notification/unread
 */
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;
    const count = await notificationService.getUnreadCount(userId);

    res.json({ unread: count });
});

/**
 * Mark notification as read
 * POST /api/v1/notification/:id/read
 */
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await notificationService.markAsRead(id);

    res.json({ message: 'Notification marked as read' });
});

/**
 * Mark all notifications as read
 * POST /api/v1/notification/read-all
 */
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    await notificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read' });
});

/**
 * Mark notification as seen
 * POST /api/v1/notification/:id/seen
 */
export const markAsSeen = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await notificationService.markAsSeen(id);

    res.json({ message: 'Notification marked as seen' });
});

/**
 * Delete notification
 * DELETE /api/v1/notification/:id
 */
export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await notificationService.delete(id);

    res.json({ message: 'Notification deleted' });
});

/**
 * Get notification preferences
 * GET /api/v1/notification/preferences
 */
export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;

    const preferences = await notificationService.getPreferences(userId);

    res.json(preferences);
});

/**
 * Update notification preferences
 * PUT /api/v1/notification/preferences
 */
export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id!;
    const updates = req.body;

    const preferences = await notificationService.updatePreferences(userId, updates);

    res.json({
        message: 'Preferences updated successfully',
        preferences
    });
});

// 🔥 FCM TOKEN MANAGEMENT

/**
 * Register FCM token for push notifications
 * POST /api/v1/notifications/register
 */
export const registerFCMToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    const { fcmToken } = req.body;

    if (!userId) {
        throw new CustomError('User ID is missing', 400);
    }

    if (!fcmToken) {
        throw new CustomError('FCM token is required', 400);
    }

    try {
        // Get current user tokens
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true }
        });

        // Check if token already exists
        const existingTokens = user?.fcmTokens || [];

        if (!existingTokens.includes(fcmToken)) {
            // Add new token to the array
            await prisma.user.update({
                where: { id: userId },
                data: {
                    fcmTokens: {
                        push: fcmToken
                    }
                }
            });

            console.log(`✅ FCM token registered for user ${userId}`);
            res.status(200).json({
                message: 'FCM token registered successfully',
                tokenCount: existingTokens.length + 1
            });
        } else {
            console.log(`ℹ️ FCM token already registered for user ${userId}`);
            res.status(200).json({
                message: 'FCM token already registered',
                tokenCount: existingTokens.length
            });
        }
    } catch (error) {
        console.error('❌ Error registering FCM token:', error);
        throw new CustomError('Failed to register FCM token', 500);
    }
});

/**
 * Remove FCM token (e.g., on logout)
 * POST /api/v1/notifications/unregister
 */
export const removeFCMToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    const { fcmToken } = req.body;

    if (!userId) {
        throw new CustomError('User ID is missing', 400);
    }

    if (!fcmToken) {
        throw new CustomError('FCM token is required', 400);
    }

    try {
        // Get current tokens
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true }
        });

        // Remove the token
        const updatedTokens = (user?.fcmTokens || []).filter(token => token !== fcmToken);

        await prisma.user.update({
            where: { id: userId },
            data: {
                fcmTokens: updatedTokens
            }
        });

        console.log(`✅ FCM token removed for user ${userId}`);
        res.status(200).json({
            message: 'FCM token removed successfully',
            tokenCount: updatedTokens.length
        });
    } catch (error) {
        console.error('❌ Error removing FCM token:', error);
        throw new CustomError('Failed to remove FCM token', 500);
    }
});
