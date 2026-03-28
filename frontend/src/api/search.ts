import { apiClient } from '../lib/apiClient';
import type { GlobalSearchResponse, SearchType } from '@/types/types';

// AbortController for cancelling pending requests
let searchAbortController: AbortController | null = null;

export const searchService = {
    globalSearch: async (
        query: string,
        type: SearchType = 'all',
        limit: number = 10
    ): Promise<GlobalSearchResponse> => {
        try {
            // Cancel previous search request if still pending
            if (searchAbortController) {
                searchAbortController.abort();
            }

            // Create new AbortController for this request
            searchAbortController = new AbortController();

            const response = await apiClient.get('/search', {
                params: { q: query, type, limit },
                signal: searchAbortController.signal,
            });

            return response.data;
        } catch (error: any) {
            // Don't throw error if request was cancelled (user is still typing)
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                throw error; // Re-throw so React Query knows it was cancelled
            }

            // Handle rate limiting
            if (error.response?.status === 429) {
                throw new Error('Too many searches. Please wait a moment and try again.');
            }

            // Handle validation errors
            if (error.response?.status === 400) {
                throw new Error(error.response?.data?.message || 'Invalid search query');
            }

            // Handle authentication errors
            if (error.response?.status === 401) {
                throw new Error('Please sign in to search');
            }

            // Generic server error
            if (error.response?.status >= 500) {
                throw new Error('Search service is temporarily unavailable. Please try again later.');
            }

            // Network error
            if (!error.response) {
                throw new Error('Network error. Please check your connection and try again.');
            }

            // Fallback error
            throw new Error('Search failed. Please try again.');
        }
    },

    getSearchHistory: async (): Promise<{ searches: any[] }> => {
        try {
            const response = await apiClient.get('/search/history');
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch search history:', error);
            return { searches: [] }; // Return empty array instead of failing
        }
    },

    clearSearchHistory: async (): Promise<{ message: string }> => {
        try {
            const response = await apiClient.delete('/search/history');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { message: 'No search history to clear' };
            }
            throw new Error('Failed to clear search history. Please try again.');
        }
    },

    deleteSearchHistoryItem: async (searchId: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.delete(`/search/history/${searchId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { message: 'Search history item not found' };
            }
            throw new Error('Failed to delete search history item. Please try again.');
        }
    },

    getTrendingTopics: async (limit: number = 10, days: number = 7): Promise<{
        message: string;
        trending: Array<{
            id: string;
            name: string;
            slug: string;
            count: number;
        }>;
        period: string;
    }> => {
        try {
            const response = await apiClient.get('/trending/topics', {
                params: { limit, days },
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch trending topics:', error);
            // Return empty trending instead of failing the whole sidebar
            return {
                message: 'No trending topics available',
                trending: [],
                period: `${days} days`,
            };
        }
    },

    getTrendingUsers: async (limit: number = 5): Promise<{
        message: string;
        trending: Array<{
            id: string;
            firstName: string;
            lastName: string;
            profile?: {
                profilePic?: string;
                bio?: string;
                department?: string;
            };
            stats: {
                followers: number;
                totalLikes: number;
                totalComments: number;
                engagementScore: number;
            };
        }>;
    }> => {
        try {
            const response = await apiClient.get('/trending/users', {
                params: { limit },
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch trending users:', error);
            return {
                message: 'No trending users available',
                trending: [],
            };
        }
    },
};
