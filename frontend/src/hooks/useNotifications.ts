// Push Notifications Hook
import { useEffect } from 'react';
import { getToken, onMessage, messaging } from '@/services/firebase';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-toastify';

export const useNotifications = () => {
    useEffect(() => {
        const requestPermission = async () => {
            try {
                if (!messaging) {
                    console.warn('⚠️ Firebase messaging not initialized');
                    return;
                }

                // Check if notifications are supported
                if (!('Notification' in window)) {
                    console.log('❌ This browser does not support notifications');
                    return;
                }

                // Check current permission status
                if (Notification.permission === 'denied') {
                    console.log('❌ Notification permission denied');
                    return;
                }

                // Request notification permission
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    console.log('✅ Notification permission granted');

                    // Get FCM token
                    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

                    if (!vapidKey) {
                        console.error('❌ VAPID key not configured');
                        return;
                    }

                    const token = await getToken(messaging, { vapidKey });

                    if (token) {
                        console.log('🔑 FCM Token obtained:', token.substring(0, 20) + '...');

                        // Send token to backend
                        try {
                            await apiClient.post('/notification/register', { fcmToken: token });
                            console.log('✅ FCM token registered with backend');
                        } catch (error) {
                            console.error('❌ Failed to register FCM token:', error);
                        }
                    } else {
                        console.log('❌ No registration token available');
                    }

                    // Listen for foreground messages
                    onMessage(messaging, (payload) => {
                        console.log('📨 Foreground message received:', payload);

                        const title = payload.notification?.title || 'New Message';
                        const body = payload.notification?.body || '';

                        // Show toast notification when app is in foreground
                        toast.info(
                            `${title}: ${body}`,
                            {
                                position: 'top-right',
                                autoClose: 5000,
                                closeOnClick: true,
                                onClick: () => handleNotificationClick(payload.data)
                            }
                        );

                        // Play notification sound (optional)
                        try {
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(e => console.log('Could not play sound:', e));
                        } catch (e) {
                            // Ignore audio errors
                        }
                    });
                } else if (permission === 'default') {
                    console.log('ℹ️ Notification permission not yet requested');
                } else {
                    console.log('❌ Notification permission denied');
                }
            } catch (error) {
                console.error('❌ Error setting up notifications:', error);
            }
        };

        requestPermission();
    }, []);
};

// Handle notification click
const handleNotificationClick = (data: any) => {
    if (data?.userId) {
        // Navigate to conversation
        window.location.href = `/messages?userId=${data.userId}`;
    } else if (data?.url) {
        window.location.href = data.url;
    }
};
