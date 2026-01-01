import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/api/conversation';
import { queryKeys } from '@/lib/queryClient';
import { SendMessageInput } from '@/types/types';
import { toast } from 'react-toastify';

export const useSendMessage = (receiverId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageInput) => conversationService.sendMessage(data),
    onSuccess: () => {
      // ✅ FIX: Invalidate messages query
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(receiverId),
      });
      
      // ✅ FIX: CRITICAL - Invalidate conversation list so sidebar updates
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list,
      });

      // ✅ FIX: Also invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.unreadCount,
      });
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useMarkAsRead = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversationService.markAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list,
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.unreadCount,
      });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => conversationService.uploadFile(file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });
};