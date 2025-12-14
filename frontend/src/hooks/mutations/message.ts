// src/hooks/mutations/message.ts
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
      // Invalidate messages to show new message
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(receiverId),
      });
      
      // Invalidate conversation list to update preview
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useMarkAsRead = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => conversationService.markAsRead(userId),
    onSuccess: () => {
      // Update conversation list unread counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list,
      });
      
      // Update total unread count
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