// src/hooks/queries/conversation.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { conversationService } from '@/api/conversation';
import { queryKeys } from '@/lib/queryClient';

// Get all conversations
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations.list,
    queryFn: conversationService.getConversations,
    staleTime: 30 * 1000, // Fresh for 30 seconds
    // ✅ NO POLLING - MessageEventCoordinator handles real-time updates via sockets
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.conversations.unreadCount,
    queryFn: conversationService.getUnreadCount,
    staleTime: 30 * 1000,
    // ✅ NO POLLING - MessageEventCoordinator handles real-time updates via sockets
  });
};

// Search users
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: queryKeys.conversations.search(query),
    queryFn: () => conversationService.searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get messages with infinite scroll
export const useMessages = (userId: string) => {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.conversation(userId),
    queryFn: ({ pageParam }) =>
      conversationService.getMessages(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};