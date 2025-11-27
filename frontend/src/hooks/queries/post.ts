import { postService } from "@/api/post";
import { queryKeys } from "@/lib/queryClient";
import { Post } from "@/types/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";


export const useAllPosts = (options?: UseQueryOptions<{ posts: Post[] }, Error>) => {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: postService.getAllPosts,
    staleTime: 1 * 60 * 1000, // Posts considered fresh for 1 minute
    ...options,
  });
};

export const useUserPosts = (
  userId: string,
  options?: UseQueryOptions<{ posts: Post[] }, Error>
) => {
  return useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: () => postService.getPostsByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useCurrentUserPosts = (options?: UseQueryOptions<{ posts: Post[] }, Error>) => {
  return useQuery({
    queryKey: queryKeys.posts.currentUser(),
    queryFn: postService.getCurrentUserPosts,
    ...options,
  });
};