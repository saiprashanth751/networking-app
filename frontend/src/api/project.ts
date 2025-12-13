import { Project, CreateProjectInput, UpdateProjectInput } from '@/types/types';
import { apiClient, createFormDataRequest } from '../lib/apiClient';

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<{ projects: Project[] }> => {
    const response = await apiClient.get('/project/all');
    return response.data;
  },

  // Get project by ID
  getProjectById: async (projectId: string): Promise<{ project: Project }> => {
    const response = await apiClient.get(`/project/${projectId}`);
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
    const response = await apiClient.put(`/project/update/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/project/${projectId}`);
  },

  // Toggle featured status
  toggleFeatured: async (projectId: string): Promise<{ project: Project }> => {
    const response = await apiClient.put(`/project/featured/${projectId}`);
    return response.data;
  },
};