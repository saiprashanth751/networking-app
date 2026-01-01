// src/pages/Messages.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/hooks/queries/user';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatThread } from '@/components/messaging/ChatThread';
import { EmptyState } from '@/components/messaging/EmptyState';
import { CallManager } from '@/components/calling/CallManager';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { CallProvider } from '@/components/calling/CallProvider';
import { createCallLogger } from '@/utils/callLogger';

export default function MessagesPage() {
  const logger = createCallLogger({file: 'pages/Messages.tsx'});
  logger.info("[Mounted] Messages.tsx Mounted. Here we will create socket");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  logger.info(`Selected user id is : ${selectedUserId}`);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user?.id || '';

  // 🔥 FIX: SINGLE socket connection for entire Messages page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserId) return;

    console.log('[Messages] Creating SINGLE socket connection');
    logger.info("Started creating socket.")

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],   
      auth: { token },
      // 🔥 Prevent duplicate connections
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true // Force new connection, don't reuse
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Messages] ✅ Socket connected:', newSocket.id);
      logger.info("Socket successfully created in Messages page.", newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Messages] ❌ Socket disconnected:', reason);
      logger.info("Socket disconnected in Messages page")
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Messages] Connection error:', error);
      logger.info("Connection error in message page while creating socket")
    });

    return () => {
      console.log('[Messages] 🔌 Cleaning up socket connection');
      newSocket.disconnect();
      setSocket(null);
    };
  }, [currentUserId]); // Add currentUserId as dependency

  const handleSelectUser = (userId: string) => {
    setSearchParams({ userId });
    logger.info("Clicked on a conversation to communicate with user id", {userId});
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  return (
    // Wrap everything in CallProvider
    <CallProvider socket={socket}>
      {/* CallManager now uses context, doesn't need socket prop */}
      <CallManager socket={socket} />

      <div className="min-h-screen bg-black text-white">
        <LeftSidebar />

        <div className="lg:ml-[275px] h-screen flex">
          {/* Conversation List */}
          <div
            className={`
              w-full lg:w-[400px] border-r border-neutral-800 flex-shrink-0
              ${selectedUserId ? 'hidden lg:flex' : 'flex'}
              flex-col
            `}
          >
            <ConversationList
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId || undefined}
            />
          </div>  

          {/* Chat Thread */}
          <div
            className={`
              flex-1 
              ${!selectedUserId ? 'hidden lg:flex' : 'flex'}
              flex-col
            `}
          >
            {selectedUserId ? (
              <ChatThread 
                userId={selectedUserId} //otherUserId with whom we need to communicate
                onBack={handleBackToList} //ignore for now.
                socket={socket} // Pass the socket down. ***Notice the same socket is being passed down.
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </CallProvider>
  );
}