// src/lib/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

// Custom error handler for all queries
const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
      toast.error('Session expired. Please sign in again.');
      return;
    }

    // Handle other HTTP errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
};

// Create the query client with optimal defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data considered fresh for 5 minutes (profile, user data)
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time: Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests (useful for network issues)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Refetch when network reconnects
      refetchOnReconnect: true,

      // Don't refetch on component mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },

  // Global error handler for all queries
  queryCache: new QueryCache({
    onError: handleError,
  }),

  // Global error handler for all mutations
  mutationCache: new MutationCache({
    onError: handleError,
  }),
});

// Query keys - Centralized for consistency and type safety
export const queryKeys = {
  // User related queries
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (userId?: string) =>
      userId
        ? [...queryKeys.user.all, 'profile', userId] as const
        : [...queryKeys.user.all, 'profile'] as const,
    search: (query: string) => [...queryKeys.user.all, 'search', query] as const,
    bulk: (minor: string) => [...queryKeys.user.all, 'bulk', minor] as const,
  },

  // Posts related queries
  posts: {
    all: ['posts'] as const,
    list: (filters?: {
      categorySlugs?: string[];
      tagSlugs?: string[];
      followingOnly?: boolean;
      type?: string;
      sort?: string;
    }) => [...queryKeys.posts.all, 'list', filters] as const,
    detail: (postId: string) => [...queryKeys.posts.all, 'detail', postId] as const,
    byUser: (userId: string) => [...queryKeys.posts.all, 'byUser', userId] as const,
    currentUser: () => [...queryKeys.posts.all, 'currentUser'] as const,
  },

  // Follow related queries
  follow: {
    all: ['follow'] as const,
    status: (userId: string) => [...queryKeys.follow.all, 'status', userId] as const,
    followers: (userId?: string) =>
      userId
        ? [...queryKeys.follow.all, 'followers', userId] as const
        : [...queryKeys.follow.all, 'followers'] as const,
    following: (userId?: string) =>
      userId
        ? [...queryKeys.follow.all, 'following', userId] as const
        : [...queryKeys.follow.all, 'following'] as const,
  },

  // Messages related queries
  messages: {
    all: ['messages'] as const,
    conversation: (userId: string) => [...queryKeys.messages.all, 'conversation', userId] as const,
  },

  // Add this inside the queryKeys object
  projects: {
    all: ['projects'] as const,
    list: (filters?: { category?: string; featured?: boolean }) =>
      [...queryKeys.projects.all, 'list', filters] as const,
    detail: (projectId: string) => [...queryKeys.projects.all, 'detail', projectId] as const,
    byUser: (userId: string) => [...queryKeys.projects.all, 'byUser', userId] as const,
    currentUser: () => [...queryKeys.projects.all, 'currentUser'] as const,
  },

  conversations: {
    all: ['conversations'] as const,
    list: ['conversations', 'list'] as const,
    unreadCount: ['conversations', 'unreadCount'] as const,
    search: (query: string) => ['conversations', 'search', query] as const,
    detail: (userId: string) => ['conversations', 'detail', userId] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.categories.all, 'detail', slug] as const,
    posts: (slug: string, filters?: { page?: number; limit?: number }) =>
      [...queryKeys.categories.all, 'posts', slug, filters] as const,
  },

  // Tags
  tags: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tags.all, 'list'] as const,
    search: (query: string) => [...queryKeys.tags.all, 'search', query] as const,
    trending: () => [...queryKeys.tags.all, 'trending'] as const,
    posts: (slug: string, filters?: { page?: number; limit?: number }) =>
      [...queryKeys.tags.all, 'posts', slug, filters] as const,
  },

  // Comments
  comments: {
    all: ['comments'] as const,
    byPost: (postId: string, filters?: { page?: number; limit?: number; sort?: string }) =>
      [...queryKeys.comments.all, 'byPost', postId, filters] as const,
    replies: (commentId: string, filters?: { page?: number; limit?: number }) =>
      [...queryKeys.comments.all, 'replies', commentId, filters] as const,
  },

  // Bookmarks
  bookmarks: {
    all: ['bookmarks'] as const,
    list: (filters?: { page?: number; limit?: number; collectionId?: string }) =>
      [...queryKeys.bookmarks.all, 'list', filters] as const,
  },

  // Drafts
  drafts: {
    all: ['drafts'] as const,
    list: () => [...queryKeys.drafts.all, 'list'] as const,
    detail: (draftId: string) => [...queryKeys.drafts.all, 'detail', draftId] as const,
  },

  // Filter Presets
  filterPresets: {
    all: ['filterPresets'] as const,
    list: () => [...queryKeys.filterPresets.all, 'list'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    user: () => [...queryKeys.reports.all, 'user'] as const,
  },

} as const;