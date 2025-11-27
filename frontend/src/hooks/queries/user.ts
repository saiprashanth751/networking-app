import { userService } from '@/api/user';
import { queryKeys } from '@/lib/queryClient';
import { User } from '@/types/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useCurrentUser = (options?: UseQueryOptions<{ user: User }, Error>) => {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: userService.getCurrentUser,
    ...options,
  });
};

export const useUser = (userId: string, options?: UseQueryOptions<{ user: User }, Error>) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId, // Only run if userId exists
    ...options,
  });
};

export const useSearchUsers = (
  searchQuery: string,
  options?: UseQueryOptions<{ users: User[] }, Error>
) => {
  return useQuery({
    queryKey: queryKeys.user.search(searchQuery),
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.trim().length > 0, // Only search if query is not empty
    staleTime: 30 * 1000, // Search results stale after 30 seconds
    ...options,
  });
};

export const useUsersByMinor = (
  minor: string,
  options?: UseQueryOptions<{ users: User[] }, Error>
) => {
  return useQuery({
    queryKey: queryKeys.user.bulk(minor),
    queryFn: () => userService.getUsersByMinor(minor),
    enabled: !!minor,
    ...options,
  });
};