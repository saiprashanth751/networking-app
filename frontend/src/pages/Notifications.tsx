import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/queries/notification';
import { useNotificationListener } from '@/hooks/useNotificationListener';
import { Notification } from '@/api/notification';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';

type FilterType = 'all' | 'unread';

export default function Notifications() {
    const [filter, setFilter] = useState<FilterType>('all');
    const navigate = useNavigate();

    // Initialize real-time listener
    useNotificationListener();

    // Fetch notifications
    const { data: notificationsData, isLoading, error } = useNotifications({
        limit: 50,
        unreadOnly: filter === 'unread',
    });

    const markAsReadMutation = useMarkAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();
    const deleteNotificationMutation = useDeleteNotification();

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unread || 0;

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            markAsReadMutation.mutate(notification.id);
        }

        // Navigate based on notification type
        if (notification.entityType === 'post' && notification.entityId) {
            // For likes and post shares
            navigate(`/post/${notification.entityId}`);
        } else if (notification.entityType === 'comment' && notification.data?.postId) {
            // For comments and replies - navigate to the post
            navigate(`/post/${notification.data.postId}`);
        } else if (notification.type === 'NEW_FOLLOWER' && notification.actorId) {
            // For new followers
            navigate(`/profile/${notification.actorId}`);
        }
    };

    const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        markAsReadMutation.mutate(notificationId);
    };

    const handleDelete = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        if (confirm('Delete this notification?')) {
            deleteNotificationMutation.mutate(notificationId);
        }
    };

    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            markAllAsReadMutation.mutate();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-neutral-200 dark:border-neutral-800 p-4 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={markAllAsReadMutation.isPending}
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'unread'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                    >
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-neutral-500">Loading notifications...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <p className="text-red-500">Error loading notifications</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : "When you get notifications, they'll show up here"}
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                                }`}
                        >
                            <div className="flex gap-4">
                                {/* Actor Avatar */}
                                <div className="flex-shrink-0 mt-1">
                                    {notification.actor?.profile?.profilePic ? (
                                        <img
                                            src={notification.actor.profile.profilePic}
                                            alt={notification.actor.firstName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                                            {notification.actor?.firstName?.[0] || '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-900 dark:text-white mb-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-start gap-2">
                                    {!notification.read && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                                            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, notification.id)}
                                        className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="w-4 h-4 text-neutral-500" />
                                    </button>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.read && (
                                    <div className="flex-shrink-0 mt-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
