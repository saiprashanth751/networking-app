import { CreatePostInput, Post } from '@/types/types';
import { apiClient, createFormDataRequest } from '../lib/apiClient';

export const postService = {
  // Get all posts
  getAllPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get('/post');
    return response.data;
  },

  // Get posts by user ID
  getPostsByUserId: async (userId: string): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get(`/post/user/${userId}`);
    return response.data;
  },

  // Get current user's posts
  getCurrentUserPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await apiClient.get('/post/user');
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

  // ============================================================================
  // PRODUCTION WORKFLOW
  // ============================================================================

  // Create draft post (Step 1)
  createDraft: async (data: Partial<CreatePostInput>): Promise<{ post: Post }> => {
    const response = await apiClient.post('/post/draft', data);
    return response.data;
  },

  // Publish draft post (Step 3)
  publishPost: async (postId: string): Promise<{ post: Post }> => {
    const response = await apiClient.patch(`/post/${postId}/publish`);
    return response.data;
  },

  // ============================================================================
  // ENHANCED POST SYSTEM
  // ============================================================================

  // Update post
  updatePost: async (postId: string, data: Partial<CreatePostInput>): Promise<{ post: Post }> => {
    const response = await apiClient.put(`/post/${postId}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/post/${postId}`);
  },

  // Get single post by ID
  getPostById: async (postId: string): Promise<{ post: Post }> => {
    const response = await apiClient.get(`/post/single/${postId}`);
    return response.data;
  },
};

// ============================================================================
// CATEGORY SERVICE
// ============================================================================

export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('/category');
    return response.data;
  },

  getCategoryBySlug: async (slug: string) => {
    const response = await apiClient.get(`/category/${slug}`);
    return response.data;
  },

  getPostsByCategory: async (slug: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/category/${slug}/posts`, { params });
    return response.data;
  },
};

// ============================================================================
// TAG SERVICE
// ============================================================================

export const tagService = {
  searchTags: async (query: string, limit = 10) => {
    const response = await apiClient.get('/tag/search', { params: { q: query, limit } });
    return response.data;
  },

  getTrendingTags: async (limit = 10) => {
    const response = await apiClient.get('/tag/trending', { params: { limit } });
    return response.data;
  },

  getPostsByTag: async (slug: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/tag/${slug}/posts`, { params });
    return response.data;
  },
};

// ============================================================================
// ENGAGEMENT SERVICE
// ============================================================================

export const engagementService = {
  // Likes
  toggleLike: async (postId: string) => {
    const response = await apiClient.post(`/engagement/posts/${postId}/like`);
    return response.data;
  },

  getPostLikes: async (postId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/engagement/posts/${postId}/likes`, { params });
    return response.data;
  },

  // Comments
  addComment: async (postId: string, content: string, parentId?: string) => {
    const response = await apiClient.post(`/engagement/posts/${postId}/comments`, { content, parentId });
    return response.data;
  },

  getPostComments: async (postId: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const response = await apiClient.get(`/engagement/posts/${postId}/comments`, { params });
    return response.data;
  },

  getCommentReplies: async (commentId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/engagement/comments/${commentId}/replies`, { params });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    await apiClient.delete(`/engagement/comments/${commentId}`);
  },

  toggleCommentLike: async (commentId: string) => {
    const response = await apiClient.post(`/engagement/comments/${commentId}/like`);
    return response.data;
  },

  // Bookmarks
  toggleBookmark: async (postId: string, collectionId?: string) => {
    const response = await apiClient.post(`/engagement/posts/${postId}/bookmark`, { collectionId });
    return response.data;
  },

  getUserBookmarks: async (params?: { page?: number; limit?: number; collectionId?: string }) => {
    const response = await apiClient.get('/engagement/bookmarks', { params });
    return response.data;
  },

  // Shares
  recordShare: async (postId: string, platform?: string) => {
    const response = await apiClient.post(`/engagement/posts/${postId}/share`, { platform });
    return response.data;
  },
};

// ============================================================================
// DRAFT SERVICE
// ============================================================================

export const draftService = {
  saveDraft: async (draftData: any) => {
    const response = await apiClient.post('/draft', draftData);
    return response.data;
  },

  getUserDrafts: async () => {
    const response = await apiClient.get('/draft');
    return response.data;
  },

  getDraft: async (draftId: string) => {
    const response = await apiClient.get(`/draft/${draftId}`);
    return response.data;
  },

  deleteDraft: async (draftId: string) => {
    await apiClient.delete(`/draft/${draftId}`);
  },
};