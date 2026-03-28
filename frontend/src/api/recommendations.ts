import { apiClient } from '../lib/apiClient';

export interface RecommendedUser {
    id: string;
    firstName: string;
    lastName: string;
    profile: {
        profilePic?: string | null;
        bio?: string | null;
    };
    _count: {
        followers: number;
        following: number;
    };
    mutualConnectionsCount?: number;
}

export const recommendationService = {
    /**
     * Get recommended users to follow
     * @param limit Maximum number of recommendations (default 5, max 20)
     */
    getRecommendedUsers: async (limit = 5): Promise<{ users: RecommendedUser[] }> => {
        const response = await apiClient.get('/follow/recommended', {
            params: { limit },
        });
        return response.data;
    },
};
