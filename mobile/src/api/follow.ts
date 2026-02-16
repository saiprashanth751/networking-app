import { FollowersResponse, FollowingResponse, FollowStatus } from '@/types/types';
import { apiClient } from '../lib/apiClient';

export const followService = {
  // Check follow status
  getFollowStatus: async (userId: string): Promise<FollowStatus> => {
    const response = await apiClient.get(`/follow/?id=${userId}`);
    return response.data;
  },

  // Follow user
  followUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/follow/?id=${userId}`);
  },

  // Unfollow user
  unfollowUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/follow/?id=${userId}`);
  },

  // Get followers (current user)
  getFollowers: async (): Promise<FollowersResponse> => {
    const response = await apiClient.get('/follow/followers');
    return response.data;
  },

  // Get following (current user)
  getFollowing: async (): Promise<FollowingResponse> => {
    const response = await apiClient.get('/follow/following');
    return response.data;
  },

  // Get followers by user ID
  getFollowersByUserId: async (userId: string): Promise<FollowersResponse> => {
    const response = await apiClient.get(`/follow/userFollowers/?id=${userId}`);
    return response.data;
  },

  // Get following by user ID
  getFollowingByUserId: async (userId: string): Promise<FollowingResponse> => {
    const response = await apiClient.get(`/follow/userFollowing/?id=${userId}`);
    return response.data;
  },
};