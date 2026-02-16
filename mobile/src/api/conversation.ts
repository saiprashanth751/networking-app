// src/api/conversation.ts
import { apiClient } from '@/lib/apiClient';
import {
  ConversationResponse,
  UnreadCountResponse,
  MessageSearchUsersResponse,
  PaginatedMessages,
  SendMessageInput,
} from '@/types/types';

export const conversationService = {
  getConversations: async (): Promise<ConversationResponse> => {
    const response = await apiClient.get('/conversation');
    return response.data;
  },

  // Keep for potential future use, but NOT called on navigation
  getOrCreateConversation: async (userId: string) => {
    const response = await apiClient.get(`/conversation/${userId}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get('/conversation/unread-count');
    return response.data;
  },

  searchUsers: async (query: string): Promise<MessageSearchUsersResponse> => {
    const response = await apiClient.get('/conversation/search', {
      params: { q: query },
    });
    return response.data;
  },

  // 🔥 OPTIMIZED: Always use paginated endpoint with cursor-based queries
  getMessages: async (
    userId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<PaginatedMessages> => {
    const response = await apiClient.get(`/message/paginated/${userId}`, {
      params: {
        ...(cursor && { cursor }),
        limit
      },
    });

    return {
      messages: response.data.messages || [],
      nextCursor: response.data.nextCursor || null,
      hasMore: response.data.hasMore || false,
    };
  },

  sendMessage: async (data: SendMessageInput) => {
    const response = await apiClient.post('/message/send', data);
    return response.data;
  },

  markAsRead: async (userId: string) => {
    const response = await apiClient.put(`/message/read/${userId}`);
    return response.data;
  },

  uploadFile: async (file: File): Promise<{ url: string; type: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/message/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      url: response.data.mediaUrl,
      type: response.data.mediaType,
    };
  },
};