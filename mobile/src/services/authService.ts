import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../lib/apiClient';

class AuthService {
    private accessToken: string | null = null;

    async login(email: string, password: string) {
        const response = await apiClient.post('/auth/signin', { email, password });

        this.accessToken = response.data.token;
        if (this.accessToken) {
            await SecureStore.setItemAsync('accessToken', this.accessToken);
        }

        return response.data.user;
    }

    async signup(data: { firstName: string; lastName: string; email: string; password: string }) {
        const response = await apiClient.post('/auth/signup', data);

        this.accessToken = response.data.token;
        if (this.accessToken) {
            await SecureStore.setItemAsync('accessToken', this.accessToken);
        }

        return response.data.user;
    }

    async logout() {
        this.accessToken = null;
        await SecureStore.deleteItemAsync('accessToken');
    }

    async getAccessToken(): Promise<string | null> {
        try {
            if (!this.accessToken) {
                // Try to load from secure storage
                this.accessToken = await SecureStore.getItemAsync('accessToken');
            }
            return this.accessToken;
        } catch (error) {
            console.error('[AuthService] Error getting access token:', error);
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getAccessToken();
            return !!token;
        } catch (error) {
            console.error('[AuthService] Error checking authentication:', error);
            return false;
        }
    }

    setAccessToken(token: string) {
        this.accessToken = token;
    }
}

export const authService = new AuthService();

// Add token to all API requests
import { apiClient as client } from '../lib/apiClient';

client.interceptors.request.use(
    async (config) => {
        const token = await authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
