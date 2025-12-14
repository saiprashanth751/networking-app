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
  // Get all conversations
  getConversations: async (): Promise<ConversationResponse> => {
    const response = await apiClient.get('/conversation');
    return response.data;
  },

  // Get or create conversation with a user
  getOrCreateConversation: async (userId: string) => {
    const response = await apiClient.get(`/conversation/${userId}`);
    return response.data;
  },

  // Get total unread count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get('/conversation/unread-count');
    return response.data;
  },

  // Search users for new conversation
  searchUsers: async (query: string): Promise<MessageSearchUsersResponse> => {
    const response = await apiClient.get('/conversation/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get messages (paginated) - UPDATED TO USE CORRECT ENDPOINT
  getMessages: async (
    userId: string,
    cursor?: string,
    limit: number = 50
  ): Promise<PaginatedMessages> => {
    // Use paginated endpoint or fallback to regular
    const endpoint = cursor ? `/message/paginated/${userId}` : `/message/${userId}`;
    const response = await apiClient.get(endpoint, {
      params: cursor ? { cursor, limit } : undefined,
    });
    
    // Handle both paginated and non-paginated responses
    if (response.data.messages && !response.data.nextCursor) {
      return {
        messages: response.data.messages,
        nextCursor: null,
        hasMore: false,
      };
    }
    
    return response.data;
  },

  // Send message
  sendMessage: async (data: SendMessageInput) => {
    const response = await apiClient.post('/message/send', data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (userId: string) => {
    const response = await apiClient.put(`/message/read/${userId}`);
    return response.data;
  },

  // Upload file for message
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