import { projectService } from "@/api/project";
import { queryKeys } from "@/lib/queryClient";
import { Project } from "@/types/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// Get all projects
export const useAllProjects = (options?: Omit<UseQueryOptions<{ projects: Project[] }, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: projectService.getAllProjects,
    ...options,
  });
};

// Get project by ID
export const useProject = (
  projectId: string,
  options?: Omit<UseQueryOptions<{ project: Project }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId,
    ...options,
  });
};

// Get projects by user ID
export const useUserProjects = (
  userId: string,
  options?: Omit<UseQueryOptions<{ projects: Project[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.projects.byUser(userId),
    queryFn: () => projectService.getProjectsByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};

// Get current user's projects
export const useCurrentUserProjects = (
  options?: Omit<UseQueryOptions<{ projects: Project[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.projects.currentUser(),
    queryFn: projectService.getCurrentUserProjects,
    ...options,
  });
};