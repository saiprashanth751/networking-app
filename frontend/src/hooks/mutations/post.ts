import { postService } from "@/api/post";
import { queryKeys } from "@/lib/queryClient";
import { CreatePostInput, Post } from "@/types/types";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";


export const useCreatePost = (
  options?: UseMutationOptions<{ post: Post }, Error, CreatePostInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      // Invalidate all post-related queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      
      toast.success('Post created successfully!');
    },
    ...options,
  });
};