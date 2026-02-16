import { profileService } from "@/api/profile";
import { queryKeys } from "@/lib/queryClient";
import { CreateProfileInput, Profile, UpdateProfileInput } from "@/types/types";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useCreateProfile = (
  options?: UseMutationOptions<{ profile: Profile }, Error, CreateProfileInput>
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.createProfile,
    onSuccess: (_data) => { // renamed to _data to avoid unused var warning
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
      
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    },
    ...options,
  });
};

export const useUpdateProfile = (
  options?: UseMutationOptions<{ profile: Profile }, Error, UpdateProfileInput>
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      // Update cache with new profile data
      queryClient.setQueryData(queryKeys.user.profile(), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
      
      toast.success('Profile updated successfully!');
      navigate('/userprofile');
    },
    ...options,
  });
};