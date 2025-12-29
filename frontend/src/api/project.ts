import { Project, CreateProjectInput, UpdateProjectInput } from '@/types/types';
import { apiClient, createFormDataRequest } from '../lib/apiClient';

export const projectService = {
  // Get all projects
  getAllProjects: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    featured?: boolean;
  }): Promise<{
    projects: Project[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/ project / all ? ${queryString} ` : '/project/all';

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get project by ID
  getProjectById: async (id: string): Promise<{ project: Project }> => {
    const response = await apiClient.get(`/project/${id}`);
    return response.data;
  },

  // Get projects by user ID
  getProjectsByUserId: async (userId: string): Promise<{ projects: Project[] }> => {
    const response = await apiClient.get(`/project/user/${userId}`);
    return response.data;
  },

  // Get current user's projects
  getCurrentUserProjects: async (): Promise<{ projects: Project[] }> => {
    const response = await apiClient.get('/project/userAll');
    return response.data;
  },

  // Create project
  createProject: async (data: CreateProjectInput): Promise<{ project: Project }> => {
    const formData = createFormDataRequest(data);
    const response = await apiClient.post('/project/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, data: UpdateProjectInput): Promise<{ project: Project }> => {
    const formData = createFormDataRequest(data);
    const response = await apiClient.put(`/ project / update / ${projectId} `, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/ project / ${projectId} `);
  },

  // Toggle featured status
  toggleFeatured: async (projectId: string): Promise<{ project: Project }> => {
    const response = await apiClient.put(`/ project / featured / ${projectId} `);
    return response.data;
  },
};