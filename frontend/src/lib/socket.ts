import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO client connection
 * @param token JWT authentication token
 * @returns Socket instance
 */
export const initializeSocket = (token: string): Socket => {
    // Don't reconnect if already connected
    if (socket?.connected) {
        return socket;
    }

    // Disconnect existing socket if present
    if (socket) {
        socket.disconnect();
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error);
    });

    return socket;
};

/**
 * Get current socket instance
 * @returns Socket instance or null if not initialized
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('🔌 Socket disconnected');
    }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
    return socket?.connected ?? false;
};
