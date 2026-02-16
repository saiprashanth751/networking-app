import { AuthResponse, SigninInput, SignupInput } from '@/types/types';
import { apiClient } from '../lib/apiClient';

export const authService = {
  signup: async (data: SignupInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/signup', data);
    return response.data;
  },

  signin: async (data: SigninInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/signin', data);
    return response.data;
  },
};