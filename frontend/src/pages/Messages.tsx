// src/pages/Messages.tsx
import { useSearchParams } from 'react-router-dom';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatThread } from '@/components/messaging/ChatThread';
import { EmptyState } from '@/components/messaging/EmptyState';
import { CallManager } from '@/components/calling/CallManager';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { CallProvider } from '@/components/calling/CallProvider';
import { createCallLogger } from '@/utils/callLogger';
import { useSocket } from '@/contexts/SocketContext';

export default function MessagesPage() {
  const logger = createCallLogger({ file: 'pages/Messages.tsx' });
  logger.info("[Mounted] Messages.tsx Mounted. Using SocketContext");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  logger.info(`Selected user id is : ${selectedUserId}`);

  // ✅ FIX: Use socket from SocketContext (single instance)
  const { socket, isConnected } = useSocket();

  logger.info("Socket from context:", {
    hasSocket: !!socket,
    isConnected,
    socketId: socket?.id
  });

  const handleSelectUser = (userId: string) => {
    setSearchParams({ userId });
    logger.info("Clicked on a conversation to communicate with user id", { userId });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  return (
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

