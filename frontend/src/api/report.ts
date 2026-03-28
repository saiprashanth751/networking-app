import { apiClient } from '../lib/apiClient';
import { PostReport, ReportReason } from '../types/feed';

export const reportService = {
    reportPost: async (
        postId: string,
        data: { reason: ReportReason; description?: string }
    ): Promise<{ message: string; report: PostReport }> => {
        const response = await apiClient.post(`/report/post/${postId}`, data);
        return response.data;
    },

    getUserReports: async (): Promise<{ message: string; reports: PostReport[] }> => {
        const response = await apiClient.get('/report/user');
        return response.data;
    },
};
