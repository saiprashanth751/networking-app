import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/queries/notification';
import { useNotificationListener } from '@/hooks/useNotificationListener';
import { Notification } from '@/api/notification';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Initialize real-time listener
    useNotificationListener();

    // Fetch notifications and unread count
    const { data: notificationsData, isLoading } = useNotifications({ limit: 20 });
    const { data: unreadData } = useUnreadCount();
    const markAsReadMutation = useMarkAsRead();
    const markAllAsReadMutation = useMarkAllAsRead();

    const notifications = notificationsData?.notifications || [];
    const unreadCount = unreadData?.unread || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            markAsReadMutation.mutate(notification.id);
        }

        // Navigate based on notification type
        if (notification.entityType === 'post' && notification.entityId) {
            navigate(`/post/${notification.entityId}`);
        } else if (notification.entityType === 'comment' && notification.entityId) {
            // Navigate to post containing the comment
            // For now, we'll need the post ID - this could be in notification.data
            navigate(`/post/${notification.data?.postId || notification.entityId}`);
        } else if (notification.type === 'NEW_FOLLOWER' && notification.actorId) {
            navigate(`/profile/${notification.actorId}`);
        }

        setIsOpen(false);
    };

    const handleMarkAllRead = () => {
        markAllAsReadMutation.mutate();
    };

    const getNotificationIcon = (type: string) => {
        // You can customize icons based on notification type
        return '🔔';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {isLoading ? (
                            <div className="p-8 text-center text-neutral-500">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Actor Avatar */}
                                            <div className="flex-shrink-0">
                                                {notification.actor?.profile?.profilePic ? (
                                                    <img
                                                        src={notification.actor.profile.profilePic}
                                                        alt={notification.actor.firstName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                                        {notification.actor?.firstName?.[0] || '?'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notification Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-neutral-900 dark:text-white">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {/* Unread Indicator */}
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
