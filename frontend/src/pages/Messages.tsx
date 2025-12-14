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

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Messages] Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('[Messages] Socket disconnected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

          {/* Chat Thread - Direct render, no pre-creation */}
          <div
            className={`
              flex-1 
              ${!selectedUserId ? 'hidden lg:flex' : 'flex'}
              flex-col
            `}
          >
            {selectedUserId ? (
              <ChatThread userId={selectedUserId} onBack={handleBackToList} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </>
  );
}