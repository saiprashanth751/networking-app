import { projectService } from "@/api/project";
import { queryKeys } from "@/lib/queryClient";
import { CreateProjectInput, UpdateProjectInput, Project } from "@/types/types";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Create project
export const useCreateProject = (
  options?: UseMutationOptions<{ project: Project }, Error, CreateProjectInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create project');
    },
    ...options,
  });
};

// Update project
export const useUpdateProject = (
  projectId: string,
  options?: UseMutationOptions<{ project: Project }, Error, UpdateProjectInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      toast.success('Project updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update project');
    },
    ...options,
  });
};

// Delete project
export const useDeleteProject = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete project');
    },
    ...options,
  });
};

// Toggle featured
export const useToggleFeaturedProject = (
  projectId: string,
  options?: UseMutationOptions<{ project: Project }, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectService.toggleFeatured(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      toast.success('Project featured status updated!');
    },
    ...options,
  });
};