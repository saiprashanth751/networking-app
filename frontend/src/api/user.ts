import { SearchUsersResponse, User } from '@/types/types';
import { apiClient } from '../lib/apiClient';


export const userService = {
  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<{ user: User }> => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  // Get user profile (includes User data)
  getUserProfile: async (userId: string): Promise<{ user: User }> => {
    const response = await apiClient.get(`/user/userProfile/?id=${userId}`);
    return response.data;
  },

  // Search users
  searchUsers: async (name: string): Promise<SearchUsersResponse> => {
    const response = await apiClient.get(`/user/search?name=${name}`);
    return response.data;
  },

  // Get users by minor
  getUsersByMinor: async (minor: string): Promise<{ users: User[] }> => {
    const response = await apiClient.get(`/user/bulk/?minor=${minor}`);
    return response.data;
  },
};