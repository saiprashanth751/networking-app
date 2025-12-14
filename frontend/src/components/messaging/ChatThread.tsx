import { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/hooks/queries/conversation';
import { useSendMessage, useMarkAsRead } from '@/hooks/mutations/message';
import { useUser, useCurrentUser } from '@/hooks/queries/user';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: currentUserData } = useCurrentUser();
  const { data: otherUserData } = useUser(userId);
  const { data: messagesData, isLoading, fetchNextPage, hasNextPage } = useMessages(userId);
  const sendMessageMutation = useSendMessage(userId);
  const markAsReadMutation = useMarkAsRead(userId);

  const currentUser = currentUserData?.user;
  const otherUser = otherUserData?.user;

  // ✅ SINGLE SOURCE OF TRUTH: Only server messages
  const allMessages = messagesData?.pages.flatMap((page) => page.messages) || [];
  
  // ✅ Deduplicate by ID (just in case)
  const uniqueMessages = Array.from(
    new Map(allMessages.map(msg => [msg.id, msg])).values()
  );
  
  const isNewConversation = !isLoading && uniqueMessages.length === 0;

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uniqueMessages.length]);

  // Mark as read
  useEffect(() => {
    if (isLoading || isNewConversation) return;

    const unreadMessages = uniqueMessages.filter(
      msg => msg.receiverId === currentUser?.id && !msg.read
    );

    if (unreadMessages.length > 0) {
      const timer = setTimeout(() => markAsReadMutation.mutate(), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, uniqueMessages.length, currentUser?.id, isNewConversation]);

  // WebSocket setup
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
      console.log('✅ Socket connected');
      newSocket.emit('joinRoom', { receiverId: userId });
    });

    // ✅ FIX: On message received, just refetch - don't add to local state
    newSocket.on('receiveMessage', (message: Message) => {
      console.log('📨 New message received via WebSocket');
      
      // Refetch messages from server
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(userId),
      });
      
      // Mark as read if it's for me
      if (message.receiverId === currentUser?.id) {
        setTimeout(() => markAsReadMutation.mutate(), 200);
      }
    });

    newSocket.on('typing', ({ userId: typingUserId, isTyping: status }) => {
      if (typingUserId === userId) {
        setIsTyping(status);
      }
    });

    return () => {
      console.log('🔌 Socket disconnected');
      newSocket.disconnect();
    };
  }, [userId, currentUser?.id, queryClient]);

  const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!currentUser) return;

    try {
      // Just send - no optimistic updates
      await sendMessageMutation.mutateAsync({
        receiverId: userId,
        content,
        mediaUrl,
        mediaType,
      });

      // Mutation will handle invalidation and refetch
      // WebSocket notification happens automatically from backend
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
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
      <ChatHeader user={otherUser} socket={socket} onBack={onBack} />

      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              className="w-full py-2 text-sm text-blue-500 hover:text-blue-400"
            >
              Load older messages
            </button>
          )}

          {isNewConversation ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3 max-w-sm">
                <div className="text-neutral-500 text-sm">
                  This is the beginning of your conversation with{' '}
                  <span className="font-semibold text-white">
                    {otherUser.firstName}
                  </span>
                </div>
                <div className="text-neutral-600 text-xs">
                  Send a message to start the conversation
                </div>
              </div>
            </div>
          ) : (
            uniqueMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
                otherUser={otherUser}
              />
            ))
          )}

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

      <ChatInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}