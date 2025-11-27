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
    list: (filters?: { label?: string }) => 
      [...queryKeys.posts.all, 'list', filters] as const,
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
} as const;