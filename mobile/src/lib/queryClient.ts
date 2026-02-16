import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false, // Mobile doesn't have window focus
            refetchOnReconnect: true, // Refetch when network reconnects
        },
        mutations: {
            retry: 1,
        },
    },
});

// Query keys - Same as web app for consistency
export const queryKeys = {
    user: {
        all: ['user'] as const,
        current: () => [...queryKeys.user.all, 'current'] as const,
        profile: (userId?: string) =>
            userId
                ? [...queryKeys.user.all, 'profile', userId] as const
                : [...queryKeys.user.all, 'profile'] as const,
        search: (query: string) => [...queryKeys.user.all, 'search', query] as const,
    },

    posts: {
        all: ['posts'] as const,
        list: (filters?: any) => [...queryKeys.posts.all, 'list', filters] as const,
        detail: (postId: string) => [...queryKeys.posts.all, 'detail', postId] as const,
        byUser: (userId: string) => [...queryKeys.posts.all, 'byUser', userId] as const,
        currentUser: () => [...queryKeys.posts.all, 'currentUser'] as const,
    },

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

    messages: {
        all: ['messages'] as const,
        conversation: (userId: string) => [...queryKeys.messages.all, 'conversation', userId] as const,
    },

    projects: {
        all: ['projects'] as const,
        list: (filters?: any) => [...queryKeys.projects.all, 'list', filters] as const,
        detail: (projectId: string) => [...queryKeys.projects.all, 'detail', projectId] as const,
        byUser: (userId: string) => [...queryKeys.projects.all, 'byUser', userId] as const,
        currentUser: () => [...queryKeys.projects.all, 'currentUser'] as const,
    },

    conversations: {
        all: ['conversations'] as const,
        list: ['conversations', 'list'] as const,
        unreadCount: ['conversations', 'unreadCount'] as const,
        detail: (userId: string) => ['conversations', 'detail', userId] as const,
    },

    categories: {
        all: ['categories'] as const,
        list: () => [...queryKeys.categories.all, 'list'] as const,
    },

    tags: {
        all: ['tags'] as const,
        list: () => [...queryKeys.tags.all, 'list'] as const,
    },

    comments: {
        all: ['comments'] as const,
        byPost: (postId: string, filters?: any) =>
            [...queryKeys.comments.all, 'byPost', postId, filters] as const,
    },

    bookmarks: {
        all: ['bookmarks'] as const,
        list: (filters?: any) => [...queryKeys.bookmarks.all, 'list', filters] as const,
    },

    drafts: {
        all: ['drafts'] as const,
        list: () => [...queryKeys.drafts.all, 'list'] as const,
    },
} as const;
