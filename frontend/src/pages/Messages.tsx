import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatThread } from '@/components/messaging/ChatThread';
import { EmptyState } from '@/components/messaging/EmptyState';
import { CallManager } from '@/components/calling/CallManager';
import { LeftSidebar } from '@/components/layout/LeftSidebar';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  const [socket, setSocket] = useState<Socket | null>(null);

  // 🔥 FIX: SINGLE socket connection for entire Messages page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('[Messages] Creating SINGLE socket connection');

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
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Messages] ❌ Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Messages] Connection error:', error);
    });

    return () => {
      console.log('[Messages] 🔌 Cleaning up socket connection');
      newSocket.disconnect();
      setSocket(null);
    };
  }, []); // Empty deps - only create once

  const handleSelectUser = (userId: string) => {
    setSearchParams({ userId });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  return (
    <>
      {socket && <CallManager socket={socket} />}

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
                userId={selectedUserId} 
                onBack={handleBackToList}
                socket={socket} // 🔥 Pass the socket down
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </>
  );
}