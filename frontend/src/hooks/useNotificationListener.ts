import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import { notificationKeys } from '@/hooks/queries/notification';
import { Notification } from '@/api/notification';
import { toast } from 'react-toastify';

/**
 * Hook to listen for real-time notifications via Socket.IO
 * Automatically updates React Query cache and shows toast notifications
 */
export const useNotificationListener = () => {
    const { socket, isConnected } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for new notifications
        const handleNewNotification = (notification: Notification) => {
            console.log('📬 New notification received:', notification);

            // Update notifications cache - add to the beginning
            queryClient.setQueryData(
                notificationKeys.list(),
                (old: any) => {
                    if (!old) return old;

                    return {
                        ...old,
                        notifications: [notification, ...(old.notifications || [])],
                        total: (old.total || 0) + 1,
                        unread: (old.unread || 0) + 1,
                    };
                }
            );

            // Update unread count
            queryClient.setQueryData(
                notificationKeys.unreadCount(),
                (old: any) => ({
                    unread: (old?.unread || 0) + 1,
                })
            );

            // Show toast notification
            const actorName = notification.actor
                ? `${notification.actor.firstName} ${notification.actor.lastName || ''}`
                : 'Someone';

            toast.info(notification.message, {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        // Listen for unread count updates
        const handleUnreadCount = (data: { unread: number }) => {
            queryClient.setQueryData(notificationKeys.unreadCount(), { unread: data.unread });
        };

        // Register event listeners
        socket.on('notification:new', handleNewNotification);
        socket.on('notification:count', handleUnreadCount);

        console.log('✅ Notification listeners registered');

        // Cleanup on unmount
        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('notification:count', handleUnreadCount);
            console.log('🔌 Notification listeners removed');
        };
    }, [socket, isConnected, queryClient]);
};
