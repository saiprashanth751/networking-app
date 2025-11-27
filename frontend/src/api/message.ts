import { Message, SendMessageInput } from '@/types/types';
import { apiClient } from '../lib/apiClient';

export const messageService = {
  // Get conversation with a user
  getConversation: async (userId: string): Promise<{ messages: Message[] }> => {
    const response = await apiClient.get(`/message/${userId}`);
    return response.data;
  },

  // Send message (handled via WebSocket in your app, but keeping for reference)
  sendMessage: async (data: SendMessageInput): Promise<void> => {
    await apiClient.post('/message', data);
  },
};