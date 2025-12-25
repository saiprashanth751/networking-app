import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const mediaService = {
    uploadMedia: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/media/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        });
        return response.data;
    },

    getMedia: async (id: string) => {
        const response = await axios.get(`${API_URL}/media/${id}`, {
            withCredentials: true,
        });
        return response.data;
    },

    deleteMedia: async (id: string) => {
        const response = await axios.delete(`${API_URL}/media/${id}`, {
            withCredentials: true,
        });
        return response.data;
    },
};
