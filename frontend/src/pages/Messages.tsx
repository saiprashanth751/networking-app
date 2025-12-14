// src/pages/Messages.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatThread } from '@/components/messaging/ChatThread';
import { EmptyState } from '@/components/messaging/EmptyState';
import { CallManager } from '@/components/calling/CallManager';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  const [showChat, setShowChat] = useState(false);
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
    setShowChat(true); // For mobile
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSearchParams({});
  };

  return (
    <>
      {/* Global Call Manager */}
      {socket && <CallManager socket={socket} />}

      <div className="h-screen flex flex-col">
        {/* Header - Mobile Only */}
        <div className="lg:hidden sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
          <div className="flex items-center gap-4 px-4 h-[53px]">
            {showChat && selectedUserId ? (
              <button
                onClick={handleBackToList}
                className="hover:bg-neutral-900 rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h1 className="font-bold text-xl">Messages</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List - Left Panel */}
          <div
            className={`
              w-full lg:w-[380px] border-r border-neutral-800 flex-shrink-0
              ${showChat && selectedUserId ? 'hidden lg:block' : 'block'}
            `}
          >
            <ConversationList
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId || undefined}
            />
          </div>

          {/* Chat Thread - Right Panel */}
          <div
            className={`
              flex-1 
              ${!showChat || !selectedUserId ? 'hidden lg:flex' : 'flex'}
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