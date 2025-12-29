import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export interface QueuedMessage {
    id: string;              // Unique ID for queue management
    tempId: string;          // For optimistic UI matching
    receiverId: string;      // Target user
    content: string;         // Message content
    timestamp: number;       // When queued
    retries: number;         // Send attempt count
}

interface MessageQueue {
    [conversationId: string]: QueuedMessage[];
}

const STORAGE_KEY = 'messaging_offline_queue';
const MAX_RETRIES = 3;

export const useOfflineQueue = (socket: Socket | null) => {
    // Get queue from localStorage
    const getQueue = useCallback((): MessageQueue => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[OfflineQueue] Failed to read queue:', error);
            return {};
        }
    }, []);

    // Save queue to localStorage
    const saveQueue = useCallback((queue: MessageQueue) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('[OfflineQueue] Failed to save queue:', error);
            // Handle quota exceeded
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                toast.error('Storage full - cannot queue more messages');
            }
        }
    }, []);

    // Add message to queue
    const queueMessage = useCallback((message: QueuedMessage) => {
        const queue = getQueue();
        const conversationId = message.receiverId;

        if (!queue[conversationId]) {
            queue[conversationId] = [];
        }

        queue[conversationId].push(message);
        saveQueue(queue);

        console.log(`[OfflineQueue] Queued message for ${conversationId}`, message);
        toast.info('Message queued - will send when online', {
            position: 'bottom-right',
            autoClose: 2000
        });
    }, [getQueue, saveQueue]);

    // Get queue length for a conversation
    const getQueueLength = useCallback((conversationId: string): number => {
        const queue = getQueue();
        return queue[conversationId]?.length || 0;
    }, [getQueue]);

    // Get all queued messages for a conversation
    const getQueuedMessages = useCallback((conversationId: string): QueuedMessage[] => {
        const queue = getQueue();
        return queue[conversationId] || [];
    }, [getQueue]);

    // Send queued messages for a conversation
    const sendQueuedMessages = useCallback(async (conversationId: string) => {
        if (!socket || !socket.connected) {
            console.warn('[OfflineQueue] Cannot send - socket not connected');
            return;
        }

        const queue = getQueue();
        const messages = queue[conversationId] || [];

        if (messages.length === 0) {
            console.log('[OfflineQueue] No messages to send');
            return;
        }

        console.log(`[OfflineQueue] Sending ${messages.length} queued messages for ${conversationId}`);

        let successCount = 0;
        let failureCount = 0;

        for (const msg of messages) {
            try {
                // Attempt to send the message
                socket.emit('sendMessage', {
                    receiverId: msg.receiverId,
                    content: msg.content,
                    tempId: msg.tempId
                });

                console.log(`[OfflineQueue] ✅ Sent queued message ${msg.id}`);

                // Remove from queue on success
                queue[conversationId] = queue[conversationId].filter(
                    m => m.id !== msg.id
                );
                saveQueue(queue);
                successCount++;

                // Small delay between messages to avoid overwhelming server
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`[OfflineQueue] ❌ Failed to send message ${msg.id}:`, error);

                msg.retries++;

                if (msg.retries >= MAX_RETRIES) {
                    console.error(`[OfflineQueue] Max retries reached for message ${msg.id}`);
                    toast.error(`Failed to send message after ${MAX_RETRIES} attempts`, {
                        position: 'bottom-right'
                    });
                    failureCount++;
                    // Keep in queue for manual retry
                } else {
                    // Update retry count
                    const index = queue[conversationId].findIndex(m => m.id === msg.id);
                    if (index !== -1) {
                        queue[conversationId][index] = msg;
                        saveQueue(queue);
                    }
                }
            }
        }

        // Show success message if all sent
        if (queue[conversationId]?.length === 0) {
            toast.success(`All ${successCount} queued messages sent!`, {
                position: 'bottom-right',
                autoClose: 3000
            });
        } else if (successCount > 0) {
            toast.success(`Sent ${successCount} of ${messages.length} messages`, {
                position: 'bottom-right',
                autoClose: 3000
            });
        }
    }, [socket, getQueue, saveQueue]);

    // Clear all queued messages for a conversation
    const clearQueue = useCallback((conversationId: string) => {
        const queue = getQueue();
        delete queue[conversationId];
        saveQueue(queue);
        console.log(`[OfflineQueue] Cleared queue for ${conversationId}`);
    }, [getQueue, saveQueue]);

    // Get total queue count (all conversations)
    const getTotalQueueCount = useCallback((): number => {
        const queue = getQueue();
        return Object.values(queue).reduce((total, messages) => total + messages.length, 0);
    }, [getQueue]);

    return {
        queueMessage,
        getQueueLength,
        getQueuedMessages,
        sendQueuedMessages,
        clearQueue,
        getTotalQueueCount
    };
};
