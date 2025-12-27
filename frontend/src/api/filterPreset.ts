import { apiClient } from '../lib/apiClient';
import { FilterPreset, FeedFilters } from '../types/feed';

export const filterPresetService = {
    savePreset: async (data: {
        name: string;
        description?: string;
        filters: FeedFilters;
        isDefault?: boolean;
    }): Promise<{ message: string; preset: FilterPreset }> => {
        const response = await apiClient.post('/filter-preset', data);
        return response.data;
    },

    getPresets: async (): Promise<{ message: string; presets: FilterPreset[] }> => {
        const response = await apiClient.get('/filter-preset');
        return response.data;
    },

    deletePreset: async (presetId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`/filter-preset/${presetId}`);
        return response.data;
    },
};
