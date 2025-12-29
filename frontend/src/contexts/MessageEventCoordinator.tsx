import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/queries/user';

const MessageEventContext = createContext({});

/**
 * MessageEventCoordinator - Global real-time event handler
 * 
 * PURPOSE: Single source of truth for ALL socket events
 * - Listens to receiveMessage and messagesRead ONCE
 * - Updates ALL relevant caches (messages, conversations, unread count)
 * - Ensures consistent state across entire app
 * 
 * REPLACES: Duplicate listeners in ChatThread, ConversationList, LeftSidebar
 */
export const MessageEventCoordinator = ({ children }: { children: ReactNode }) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();
    const { data: currentUserData } = useCurrentUser();
    const currentUserId = currentUserData?.user?.id;

    useEffect(() => {
        if (!socket || !currentUserId) return;

        console.log('[EventCoordinator] 🔄 Setting up global message event handlers');

        // ========================================
        // HANDLER: receiveMessage
        // ========================================
        const handleReceiveMessage = (payload: any) => {
            const { message, tempId, conversationId } = payload;

            console.log('[EventCoordinator] 📨 receiveMessage:', {
                messageId: message.id,
                from: message.senderId,
                to: message.receiverId,
                isMe: message.senderId === currentUserId,
                conversationId
            });

            // Determine the other user in this conversation
            const otherUserId = message.senderId === currentUserId
                ? message.receiverId
                : message.senderId;

            // 1️⃣ Update messages cache (if conversation open)
            queryClient.setQueryData(
                queryKeys.messages.conversation(otherUserId),
                (old: any) => {
                    if (!old) return old; // Not viewing this conversation

                    console.log('[EventCoordinator] ✅ Updating messages cache for:', otherUserId);

                    // Remove temp message if exists (for optimistic UI)
                    const filteredMessages = old.pages.flatMap((page: any) =>
                        page.messages.filter((msg: any) => msg.id !== tempId)
                    );

                    // Add new message and sort
                    const updatedMessages = [...filteredMessages, message].sort(
                        (a: any, b: any) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );

                    return {
                        ...old,
                        pages: [{ messages: updatedMessages }]
                    };
                }
            );

            // 2️⃣ Update conversation list cache
            queryClient.setQueryData(
                queryKeys.conversations.list,
                (old: any) => {
                    if (!old) return old;

                    const conversations = old.conversations || [];
                    const convIndex = conversations.findIndex((c: any) =>
                        c.otherUser.id === message.senderId || c.otherUser.id === message.receiverId
                    );

                    if (convIndex >= 0) {
                        console.log('[EventCoordinator] ✅ Updating conversation list cache');

                        const updated = [...conversations];
                        const isReceiver = message.receiverId === currentUserId;

                        updated[convIndex] = {
                            ...updated[convIndex],
                            lastMessage: { content: message.content },
                            lastMessageAt: message.timestamp,
                            // Only increment unread if current user is RECEIVER
                            unreadCount: isReceiver
                                ? updated[convIndex].unreadCount + 1
                                : updated[convIndex].unreadCount
                        };

                        // Move to top
                        const [updatedConv] = updated.splice(convIndex, 1);
                        return { ...old, conversations: [updatedConv, ...updated] };
                    }

                    console.log('[EventCoordinator] ⚠️ Conversation not found - may be new');
                    return old;
                }
            );

            // 3️⃣ Update global unread count (only if receiver)
            if (message.receiverId === currentUserId) {
                queryClient.setQueryData(
                    queryKeys.conversations.unreadCount,
                    (old: any) => {
                        console.log('[EventCoordinator] ✅ Incrementing global unread count');
                        return {
                            ...old,
                            unreadCount: (old?.unreadCount || 0) + 1
                        };
                    }
                );
            }
        };

        // ========================================
        // HANDLER: messagesRead
        // ========================================
        const handleMessagesRead = (payload: any) => {
            const { readBy, count } = payload;

            console.log('[EventCoordinator] ✅ messagesRead:', {
                readBy,
                count
            });

            // 1️⃣ Update messages read status
            queryClient.setQueryData(
                queryKeys.messages.conversation(readBy),
                (old: any) => {
                    if (!old) return old;

                    const updatedMessages = old.pages.flatMap((page: any) =>
                        page.messages.map((msg: any) =>
                            msg.receiverId === readBy && msg.senderId === currentUserId
                                ? { ...msg, read: true, readAt: new Date() }
                                : msg
                        )
                    );

                    return {
                        ...old,
                        pages: [{ messages: updatedMessages }]
                    };
                }
            );

            // 2️⃣ Update conversation list (no action needed - already at 0)
            // The receiver already set unreadCount to 0 optimistically
        };

        // Register handlers
        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messagesRead', handleMessagesRead);

        return () => {
            console.log('[EventCoordinator] 🔌 Cleaning up event handlers');
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messagesRead', handleMessagesRead);
        };
    }, [socket, currentUserId, queryClient]);

    return (
        <MessageEventContext.Provider value={{}}>
            {children}
        </MessageEventContext.Provider>
    );
};

export const useMessageEvents = () => {
    return useContext(MessageEventContext);
};
