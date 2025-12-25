import { apiClient } from '@/lib/apiClient';

export const mediaService = {
    uploadMedia: async (postId: string, formData: FormData) => {
        // Append postId to formData (Production Workflow Step 2)
        formData.append('postId', postId);

        const response = await apiClient.post("/media/upload", formData);
        return response.data;
    },

    getMedia: async (id: string) => {
        const response = await apiClient.get(`/media/${id}`);
        return response.data;
    },

    deleteMedia: async (id: string) => {
        const response = await apiClient.delete(`media/${id}`);
        return response.data;
    },
};
