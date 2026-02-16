import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Types
export interface MutualConnection {
    id: string;
    firstName: string;
    lastName: string;
    profile?: {
        profilePic?: string;
        bio?: string;
    };
}

export interface MutualConnectionsResponse {
    message: string;
    mutualConnections: MutualConnection[];
    count: number;
    showing: number;
    connectionPath: string[];
    connectionType: 'direct' | 'mutual' | 'none';
    isFollowing: boolean;
}

// API Service
export const connectionService = {
    /**
     * Get mutual connections between current user and target user
     */
    getMutualConnections: async (userId: string): Promise<MutualConnectionsResponse> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/follow/mutual/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    /**
     * Remove a follower (someone who follows you)
     */
    removeFollower: async (followerId: string): Promise<{ message: string }> => {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/follow/remove-follower/${followerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },
};
