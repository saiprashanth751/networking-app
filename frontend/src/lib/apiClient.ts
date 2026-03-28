// src/lib/apiClient.ts
import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  // No default Content-Type - let axios set it based on data type
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

export const createFormDataRequest = (data: Record<string, any>) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // Handle arrays (e.g., multiple files, labels)
      if (value.length > 0 && value[0] instanceof Blob) {
        // Array of Blob/File objects - append each individually
        value.forEach((blob, index) => {
          // Convert Blob to File with proper name if needed
          const file = blob instanceof File
            ? blob
            : new File([blob], `image-${index}.png`, { type: blob.type || 'image/png' });
          formData.append(key, file);
        });
      } else {
        // Array of primitives - stringify
        formData.append(key, JSON.stringify(value));
      }
    } else if (value instanceof Blob) {
      // Single Blob - convert to File with proper name if needed
      const file = value instanceof File
        ? value
        : new File([value], 'image.png', { type: value.type || 'image/png' });
      formData.append(key, file);
    } else if (value instanceof Date) {
      // Date objects - convert to ISO string
      formData.append(key, value.toISOString());
    } else {
      // Primitive values
      formData.append(key, String(value));
    }
  });

  return formData;
};