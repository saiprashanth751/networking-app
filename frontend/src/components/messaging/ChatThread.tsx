// src/components/messaging/ChatThread.tsx
import { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/hooks/queries/conversation';
import { useSendMessage, useMarkAsRead } from '@/hooks/mutations/message';
import { useUser } from '@/hooks/queries/user';
import { useCurrentUser } from '@/hooks/queries/user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { Message } from '@/types/types';

interface ChatThreadProps {
  userId: string;
  onBack?: () => void;
}

export function ChatThread({ userId, onBack }: ChatThreadProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: currentUserData } = useCurrentUser();
  const { data: otherUserData } = useUser(userId);
  const { data: messagesData, isLoading, fetchNextPage, hasNextPage } = useMessages(userId);
  const sendMessageMutation = useSendMessage(userId);
  const markAsReadMutation = useMarkAsRead(userId);

  const currentUser = currentUserData?.user;
  const otherUser = otherUserData?.user;

  // Flatten all pages of messages
  const serverMessages = messagesData?.pages.flatMap((page) => page.messages) || [];
  const allMessages = [...serverMessages, ...localMessages];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages]);

  // Mark as read when opening chat
  useEffect(() => {
    if (userId) {
      markAsReadMutation.mutate();
    }
  }, [userId]);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', { receiverId: userId });
    });

    newSocket.on('receiveMessage', (message: Message) => {
      setLocalMessages((prev) => [...prev, message]);
      markAsReadMutation.mutate();
    });

    newSocket.on('typing', ({ userId: typingUserId, isTyping: status }) => {
      if (typingUserId === userId) {
        setIsTyping(status);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!currentUser) return;

    // Optimistic update
    const tempMessage: Message = {
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      receiverId: userId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      deleted: false,
      mediaUrl,
      mediaType: mediaType as any,
    };

    setLocalMessages((prev) => [...prev, tempMessage]);

    // Send via WebSocket
    if (socket) {
      socket.emit('sendMessage', { receiverId: userId, content });
    }

    // Also send via API (for persistence)
    sendMessageMutation.mutate({
      receiverId: userId,
      content,
      mediaUrl,
      mediaType,
    });
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { receiverId: userId, isTyping: true });
      setTimeout(() => {
        socket.emit('typing', { receiverId: userId, isTyping: false });
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        User not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header - Pass socket prop */}
      <ChatHeader user={otherUser} socket={socket} onBack={onBack} />

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {/* Load More Button */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              className="w-full py-2 text-sm text-blue-500 hover:text-blue-400"
            >
              Load older messages
            </button>
          )}

          {/* Messages */}
          {allMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUser?.id}
              otherUser={otherUser}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-200" />
              </div>
              <span>{otherUser.firstName} is typing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}