import { followService } from "@/api/follow";
import { queryKeys } from "@/lib/queryClient";
import { FollowersResponse, FollowingResponse, FollowStatus } from "@/types/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";


export const useFollowStatus = (
  userId: string,
  // options?: UseQueryOptions<FollowStatus, Error>
  options?: Omit<UseQueryOptions<FollowStatus, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.follow.status(userId),
    queryFn: () => followService.getFollowStatus(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Follow status fresh for 2 minutes
    ...options,
  });
};

export const useFollowers = (options?: Omit<UseQueryOptions<FollowersResponse, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.follow.followers(),
    queryFn: followService.getFollowers,
    ...options,
  });
};

export const useFollowing = (options?: Omit<UseQueryOptions<FollowingResponse, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.follow.following(),
    queryFn: followService.getFollowing,
    ...options,
  });
};

export const useFollowersByUserId = (
  userId: string,
  options?: Omit<UseQueryOptions<FollowersResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.follow.followers(userId),
    queryFn: () => followService.getFollowersByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useFollowingByUserId = (
  userId: string,
  options?: Omit<UseQueryOptions<FollowingResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.follow.following(userId),
    queryFn: () => followService.getFollowingByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};