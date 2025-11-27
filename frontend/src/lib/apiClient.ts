// src/lib/apiClient.ts
import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common response scenarios
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let React Query's error handling deal with this
    // But we can add logging here if needed
    if (error.response?.status === 401) {
      // Token expired or invalid - will be handled by queryClient
      console.log('Authentication failed');
    }
    return Promise.reject(error);
  }
);

// Helper function for multipart/form-data requests (file uploads)
export const createFormDataRequest = (data: Record<string, any>) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    if (Array.isArray(value)) {
      // Handle arrays (e.g., multiple files, labels)
      if (value.length > 0 && value[0] instanceof File) {
        // Array of files
        value.forEach((file) => formData.append(key, file));
      } else {
        // Array of primitives - stringify
        formData.append(key, JSON.stringify(value));
      }
    } else if (value instanceof File) {
      // Single file
      formData.append(key, value);
    } else {
      // Primitive values
      formData.append(key, String(value));
    }
  });
  
  return formData;
};