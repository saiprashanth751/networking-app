import { SearchUsersResponse, User, UserWithProfile } from '@/types/types';
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
  getUsersByDepartment: async (department: string): Promise<{ users: UserWithProfile[] }> => {
    const response = await apiClient.get(`/user/bulk/?department=${department}`);
    return response.data;
  },
};