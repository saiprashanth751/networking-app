import axios from 'axios';
import ENV from './config';

// Create axios instance
export const apiClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        // We'll add token from authService later
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - will implement token refresh later
            console.log('[API] Unauthorized - token may have expired');
        }

        return Promise.reject(error);
    }
);
