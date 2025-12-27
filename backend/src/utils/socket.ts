import { Server } from 'socket.io';

let io: Server | null = null;

/**
 * Initialize Socket.IO instance
 * Called from index.ts after server creation
 */
export const initializeSocketIO = (ioInstance: Server) => {
    io = ioInstance;
    console.log('✅ Socket.IO instance initialized for notifications');
};

/**
 * Get Socket.IO instance
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
    }
    return io;
};

/**
 * Emit notification to specific user
 */
export const emitNotification = (userId: string, notification: any) => {
    if (io) {
        io.to(userId).emit('notification:new', notification);
        console.log(`📬 Notification emitted to user ${userId}`);
    }
};

/**
 * Emit unread count update to specific user
 */
export const emitUnreadCount = (userId: string, count: number) => {
    if (io) {
        io.to(userId).emit('notification:count', { unread: count });
    }
};
