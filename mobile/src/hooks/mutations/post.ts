import { postService } from "@/api/post";
import { queryKeys } from "@/lib/queryClient";
import { CreatePostInput, Post } from "@/types/types";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";



export const useCreatePost = (
  options?: UseMutationOptions<{ post: Post }, Error, CreatePostInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      // Invalidate all post-related queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });

      
    },
    ...options,
  });
};

export const useUpdatePost = (
  options?: UseMutationOptions<any, Error, { postId: string; data: { content: string; categoryIds?: string[]; visibility?: string } }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }) => postService.updatePost(postId, data),
    onSuccess: (_, variables) => {
      // Invalidate post queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      
    },
    onError: (error: any) => {
      
    },
    ...options,
  });
};
