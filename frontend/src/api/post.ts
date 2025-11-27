import { CreatePostInput, Post } from '@/types/types';
import { apiClient, createFormDataRequest } from '../lib/apiClient';

export const postService = {
  // Get all posts
  getAllPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get('/post/all');
    return response.data;
  },

  // Get posts by user ID
  getPostsByUserId: async (userId: string): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get(`/post/${userId}`);
    return response.data;
  },

  // Get current user's posts
  getCurrentUserPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get('/post/userAll');
    return response.data;
  },

  // Create post
  createPost: async (data: CreatePostInput): Promise<{ post: Post }> => {
    const formData = createFormDataRequest(data);
    const response = await apiClient.post('/post/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};