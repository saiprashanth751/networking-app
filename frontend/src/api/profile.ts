import { CreateProfileInput, Profile, UpdateProfileInput } from '@/types/types';
import { apiClient, createFormDataRequest } from '../lib/apiClient';

export const profileService = {
  // Get current user's profile
  getCurrentProfile: async (): Promise<{ profile: Profile }> => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Get profile by user ID
  getProfileByUserId: async (userId: string): Promise<{ profile: Profile }> => {
    const response = await apiClient.get(`/user/${userId}/profile`);
    return response.data;
  },

  // Create profile
  createProfile: async (data: CreateProfileInput): Promise<{ profile: Profile }> => {
    const formData = createFormDataRequest(data);
    const response = await apiClient.post('/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileInput): Promise<{ profile: Profile }> => {
    const formData = createFormDataRequest(data);
    const response = await apiClient.put('/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
