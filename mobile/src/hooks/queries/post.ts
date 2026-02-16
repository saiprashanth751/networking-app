import { postService } from "@/api/post";
import { queryKeys } from "@/lib/queryClient";
import { Post } from "@/types/types";
import { useQuery, useInfiniteQuery, UseQueryOptions } from "@tanstack/react-query";


export const useAllPosts = (options?: Omit<UseQueryOptions<{ posts: Post[] }, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: postService.getAllPosts,
    staleTime: 1 * 60 * 1000, // Posts considered fresh for 1 minute
    ...options,
  });
};

export const useUserPosts = (
  userId: string,
  options?: Omit<UseQueryOptions<{ posts: Post[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: () => postService.getPostsByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useCurrentUserPosts = (options?: Omit<UseQueryOptions<{ posts: Post[] }, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.posts.currentUser(),
    queryFn: postService.getCurrentUserPosts,
    ...options,
  });
};

// Single post detail hook
export const usePost = (
  postId: string,
  options?: Omit<UseQueryOptions<{ post: Post }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postService.getPostById(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// INFINITE SCROLL FEED
// ============================================================================

export const useInfinitePosts = (
  filters?: {
    categorySlugs?: string[];
    tagSlugs?: string[];
    followingOnly?: boolean;
    type?: 'all' | 'posts' | 'projects' | 'jobs';
    sort?: 'recent' | 'popular' | 'trending';
  },
  options?: Omit<any, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: async ({ pageParam = null }) => {
      return postService.getInfinitePosts({ ...filters, cursor: pageParam });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => {
      return lastPage.nextCursor ?? undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};