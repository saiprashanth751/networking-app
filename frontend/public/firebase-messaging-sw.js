// Firebase Cloud Messaging Service Worker
// This handles background notifications when the app is not in focus

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// NOTE: You must replace these with your actual Firebase config values
firebase.initializeApp({
    apiKey: "AIzaSyBSFrFATMXGamtOUT8HpkSeiO0qpKp-GKI",
    authDomain: "network-app-notification-e8877.firebaseapp.com",
    projectId: "network-app-notification-e8877",
    storageBucket: "network-app-notification-e8877.firebasestorage.app",
    messagingSenderId: "153331259460",
    appId: "1:153331259460:web:3c0efc1ed7fc163b8c0411"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/logo.png',
        badge: '/badge.png',
        tag: payload.data?.tag || 'default',
        data: payload.data || {},
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Dismiss' }
        ],
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click received:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Handle 'open' action or click on notification body
    const urlToOpen = event.notification.data?.url || '/messages';
    const userId = event.notification.data?.userId;

    const finalUrl = userId
        ? `${self.location.origin}/messages?userId=${userId}`
        : `${self.location.origin}${urlToOpen}`;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open
                for (const client of clientList) {
                    if (client.url === finalUrl && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab
                if (clients.openWindow) {
                    return clients.openWindow(finalUrl);
                }
            })
    );
});
