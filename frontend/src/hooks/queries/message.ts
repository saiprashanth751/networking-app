import { messageService } from "@/api/message";
import { queryKeys } from "@/lib/queryClient";
import { Message } from "@/types/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useConversation = (
  userId: string,
  options?: UseQueryOptions<{ messages: Message[] }, Error>
) => {
  return useQuery({
    queryKey: queryKeys.messages.conversation(userId),
    queryFn: () => messageService.getConversation(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // Messages fresh for 30 seconds
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds for real-time feel
    ...options,
  });
};