// Call History API Service
import { apiClient } from '@/lib/apiClient';

export interface CallHistoryItem {
    id: string;
    type: 'audio' | 'video';
    status: 'completed' | 'missed' | 'declined' | 'no-answer' | 'failed';
    duration: number | null;
    startedAt: string;
    endedAt: string | null;
    isIncoming: boolean;
    otherUser: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

export const callHistoryService = {
    // Get all call history for current user
    getAll: async (): Promise<{ success: boolean; calls: CallHistoryItem[] }> => {
        const response = await apiClient.get('/call-history');
        return response.data;
    },

    // Get call history with a specific user
    getWithUser: async (userId: string): Promise<{ success: boolean; calls: CallHistoryItem[] }> => {
        const response = await apiClient.get(`/call-history/user/${userId}`);
        return response.data;
    },

    // Delete a call history entry
    deleteCall: async (callId: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(`/call-history/${callId}`);
        return response.data;
    }
};
