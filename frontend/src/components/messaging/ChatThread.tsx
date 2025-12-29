import { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/hooks/queries/conversation';
import { useUser, useCurrentUser } from '@/hooks/queries/user';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { Virtuoso } from 'react-virtuoso';
import { Loader2 } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { Message } from '@/types/types';
import { createCallLogger } from '@/utils/callLogger';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

interface ChatThreadProps {
  userId: string;
  onBack?: () => void;
  socket: Socket | null; //  Receive socket from parent
}

const logger = createCallLogger({ file: 'components/messaging/ChatThread.tsx', component: 'ChatHeader' });

export function ChatThread({ userId, onBack, socket }: ChatThreadProps) {
  logger.info("Rendering ChatThread with userId and scoket", { userId, id: socket?.id });
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // 🔥 OFFLINE QUEUE: Manage queued messages
  const { queueMessage, sendQueuedMessages, getQueueLength } = useOfflineQueue(socket);
  const queueLength = getQueueLength(userId);

  const { data: currentUserData } = useCurrentUser();
  const { data: otherUserData } = useUser(userId);
  const { data: messagesData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(userId);

  const currentUser = currentUserData?.user;
  const otherUser = otherUserData?.user;
  logger.info("What otherUser is in ChatThread? It is : ", otherUser)

  // ✅ FIX: Debounced typing to prevent bouncing UI
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);
  const hasJoinedRoomRef = useRef<string | null>(null);

  const allMessages = messagesData?.pages.flatMap((page) => page.messages) || [];
  const uniqueMessages = Array.from(
    new Map(allMessages.map(msg => [msg.id, msg])).values()   //Is it safe to do this?? Why are we doing this??
  );
  const isNewConversation = !isLoading && uniqueMessages.length === 0;


  // Mark as read via Socket.io (real-time)
  useEffect(() => {
    if (isLoading || isNewConversation || !socket) return;

    const unreadMessages = uniqueMessages.filter(
      msg => msg.receiverId === currentUser?.id && !msg.read
    );

    if (unreadMessages.length > 0) {
      const timer = setTimeout(() => {
        // ✅ Use Socket.io for instant read receipts
        socket.emit('markMessagesAsRead', { senderId: userId });

        // ✅ OPTIMISTIC UPDATE: Clear badge instantly (< 50ms)
        queryClient.setQueryData(queryKeys.conversations.list, (old: any) => {
          if (!old) return old;

          const updated = old.conversations.map((c: any) =>
            c.otherUser.id === userId ? { ...c, unreadCount: 0 } : c
          );

          return { ...old, conversations: updated };
        });

        // ✅ OPTIMISTIC UPDATE: Decrement global unread count
        queryClient.setQueryData(queryKeys.conversations.unreadCount, (old: any) => ({
          ...old,
          unreadCount: Math.max(0, (old?.unreadCount || 0) - unreadMessages.length)
        }));

        console.log(`📖 Marked ${unreadMessages.length} messages as read - badges cleared instantly`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, uniqueMessages.length, currentUser?.id, isNewConversation, socket, userId, queryClient]);

  // 🔥 FIX: Join room once when socket is CONNECTED and userId available
  useEffect(() => {
    console.log(`[ChatThread] useEffect joinRoom - socket:`, socket?.id, `userId:`, userId, `connected:`, socket?.connected);

    if (!socket || !userId || !socket.connected) {
      console.log(`[ChatThread] Cannot join room - socket:`, !!socket, `userId:`, !!userId, `connected:`, socket?.connected);
      return;
    }

    // 🔥 CRITICAL: Track by userId to prevent duplicate joins
    if (hasJoinedRoomRef.current === userId) {
      console.log(`[ChatThread] Already joined room for ${userId}, skipping`);
      return;
    }

    console.log(`[ChatThread] 🚀 EMIT joinRoom for user ${userId} on socket ${socket.id}`);
    socket.emit('joinRoom', { receiverId: userId });
    hasJoinedRoomRef.current = userId;

    // Reset when userId changes
    return () => {
      console.log(`[ChatThread] Cleaning up room for ${userId}`);
      if (hasJoinedRoomRef.current === userId) {
        hasJoinedRoomRef.current = null;
      }
    };
  }, [socket, socket?.connected, userId]);

  // 🔥 RECONNECTION SYNC: Refetch messages + Send queued messages
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log('[ChatThread] 🔄 Socket reconnected - syncing messages & sending queued');

      // 1. Invalidate and refetch messages to get any missed during offline period
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(userId)
      });

      // 2. Send any queued messages
      sendQueuedMessages(userId);

      console.log('[ChatThread] ✅ Messages synced & queue processed');
    };

    // Listen for reconnection
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [socket, userId, queryClient, sendQueuedMessages]);


  // ✅ CONVERSATION-SPECIFIC: Reconnection sync (fetch messages + send queue)
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log('[ChatThread] 🔄 Socket reconnected - syncing messages & sending queued');

      // 1. Invalidate and refetch messages to get any missed during offline period
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(userId)
      });

      // 2. Send any queued messages
      sendQueuedMessages(userId);

      console.log('[ChatThread] ✅ Messages synced & queue processed');
    };

    // Listen for reconnection
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [socket, userId, queryClient, sendQueuedMessages]);

  // ✅ CONVERSATION-SPECIFIC: Typing indicator (only for this conversation)
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId: typingUserId, isTyping: status }: {
      userId: string;
      isTyping: boolean
    }) => {
      if (typingUserId === userId) {
        setIsTyping(status);
      }
    };

    socket.on('typing', handleTyping);

    return () => {
      socket.off('typing', handleTyping);
    };
  }, [socket, userId]);

  // ✅ NOTE: receiveMessage, messagesRead handled by MessageEventCoordinator (global)
  // ChatThread no longer listens to these events to avoid duplicate processing


  const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!currentUser) return;

    // Generate unique tempId for optimistic UI
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 🔥 CHECK: If socket offline, queue the message
    if (!socket || !socket.connected) {
      console.log('[ChatThread] ⚠️ Offline - queueing message');

      queueMessage({
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tempId,
        receiverId: userId,
        content,
        timestamp: Date.now(),
        retries: 0
      });

      // Still show optimistic UI with 'queued' status
      queryClient.setQueryData(
        queryKeys.messages.conversation(userId),
        (old: any) => {
          if (!old) return old;

          const optimisticMessage: any = {
            id: tempId,
            content,
            senderId: currentUser.id,
            receiverId: userId,
            timestamp: new Date().toISOString(),
            read: false,
            readAt: undefined,
            mediaUrl,
            mediaType,
            fileName: undefined,
            fileSize: undefined,
            deleted: false,
            editedAt: undefined,
            status: 'queued', // Queued status
          };

          const allMessages = old.pages.flatMap((page: any) => page.messages);
          const updatedMessages = [...allMessages, optimisticMessage].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          return {
            ...old,
            pages: [{ messages: updatedMessages }],
          };
        }
      );

      return;
    }


    try {
      // ✅ Optimistic Update: Add message immediately to UI
      queryClient.setQueryData(
        queryKeys.messages.conversation(userId),
        (old: any) => {
          if (!old) return old;

          const optimisticMessage: any = {
            id: tempId,
            content,
            senderId: currentUser.id,
            receiverId: userId,
            timestamp: new Date().toISOString(),
            read: false,
            readAt: undefined,
            mediaUrl,
            mediaType,
            fileName: undefined,
            fileSize: undefined,
            deleted: false,
            editedAt: undefined,
            status: 'sending', // Custom status for optimistic UI
          };

          const allMessages = old.pages.flatMap((page: any) => page.messages);
          const updatedMessages = [...allMessages, optimisticMessage].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          return {
            ...old,
            pages: [{ messages: updatedMessages }],
          };
        }
      );

      // ✅ Send via Socket.io (NOT REST API)
      socket.emit('sendMessage', {
        receiverId: userId,
        content,
        mediaUrl,
        mediaType,
        tempId,
      });

      // ✅ Timeout: Mark as failed after 10 seconds
      setTimeout(() => {
        queryClient.setQueryData(
          queryKeys.messages.conversation(userId),
          (old: any) => {
            if (!old) return old;

            const messages = old.pages.flatMap((page: any) => page.messages);

            // Check if tempId still exists (means server never responded)
            const stillPending = messages.find((m: Message) => m.id === tempId);

            if (stillPending) {
              console.error('⏱️ Message timeout:', tempId);

              const updatedMessages = messages.map((msg: Message) =>
                msg.id === tempId
                  ? { ...msg, status: 'failed', error: 'Timeout - message not sent' }
                  : msg
              );

              return {
                ...old,
                pages: [{ messages: updatedMessages }],
              };
            }

            return old;
          }
        );
      }, 10000); // 10 second timeout

      console.log('✅ Message sent via Socket.io:', { tempId, content: content.substring(0, 50) });
    } catch (error) {
      console.error('❌ Failed to send message:', error);

      // Mark optimistic message as failed
      queryClient.setQueryData(
        queryKeys.messages.conversation(userId),
        (old: any) => {
          if (!old) return old;

          const updatedMessages = old.pages.flatMap((page: any) =>
            page.messages.map((msg: Message) =>
              msg.id === tempId
                ? { ...msg, status: 'failed', error: 'Failed to send' }
                : msg
            )
          );

          return {
            ...old,
            pages: [{ messages: updatedMessages }],
          };
        }
      );
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only emit "typing: true" if not already typing
    if (!isCurrentlyTypingRef.current) {
      socket.emit('typing', { receiverId: userId, isTyping: true });
      isCurrentlyTypingRef.current = true;
    }

    // Set timeout to emit "typing: false" after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isCurrentlyTypingRef.current) {
        socket.emit('typing', { receiverId: userId, isTyping: false });
        isCurrentlyTypingRef.current = false;
      }
    }, 2000); // 2 seconds
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

      {/* 🔥 OFFLINE INDICATOR */}
      {(!socket || !socket.connected) && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-yellow-500 text-sm">
            <span className="animate-pulse">⚠️</span>
            <span>Offline - Messages will be sent when connection is restored</span>
            {queueLength > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 rounded-full font-medium">
                {queueLength} queued
              </span>
            )}
          </div>
        </div>
      )}

      {/* 🔥 VIRTUOSO: Virtual scrolling for performance */}
      <Virtuoso
        style={{ flex: 1 }}
        data={uniqueMessages}
        initialTopMostItemIndex={uniqueMessages.length > 0 ? uniqueMessages.length - 1 : 0}
        followOutput="smooth"
        itemContent={(_index, message) => (
          <div className="px-4 py-2">
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser?.id}
              otherUser={otherUser}
            />
          </div>
        )}
        components={{
          Header: () => (
            hasNextPage ? (
              <div className="px-4 py-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-2 text-sm text-blue-500 hover:text-blue-400 disabled:text-neutral-500"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load older messages'
                  )}
                </button>
              </div>
            ) : isNewConversation ? (
              <div className="flex items-center justify-center py-16 px-4">
                <div className="text-center space-y-3 max-w-sm">
                  <div className="text-neutral-500 text-sm">
                    This is the beginning of your conversation with{' '}
                    <span className="font-semibold text-foreground">
                      {otherUser?.firstName}
                    </span>
                  </div>
                  <div className="text-neutral-600 text-xs">
                    Send a message to start the conversation
                  </div>
                </div>
              </div>
            ) : null
          ),
          Footer: () => (
            isTyping ? (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-200" />
                  </div>
                  <span>{otherUser?.firstName} is typing...</span>
                </div>
              </div>
            ) : null
          ),
        }}
      />


      <ChatInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}