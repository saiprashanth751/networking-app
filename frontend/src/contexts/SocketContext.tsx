import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

/**
 * SocketProvider - Manages Socket.IO connection lifecycle
 * Automatically connects when user is authenticated
 */
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Initialize socket connection
            const socketInstance = initializeSocket(token);
            setSocket(socketInstance);

            // Listen for connection status changes
            const handleConnect = () => setIsConnected(true);
            const handleDisconnect = () => setIsConnected(false);

            socketInstance.on('connect', handleConnect);
            socketInstance.on('disconnect', handleDisconnect);

            // Set initial connection state
            setIsConnected(socketInstance.connected);

            // Cleanup on unmount
            return () => {
                socketInstance.off('connect', handleConnect);
                socketInstance.off('disconnect', handleDisconnect);
                disconnectSocket();
            };
        } else {
            // No token, ensure socket is disconnected
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
        }
    }, []); // Run once on mount

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

/**
 * useSocket hook - Access socket instance from components
 */
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};
