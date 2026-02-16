import { profileService } from "@/api/profile";
import { queryKeys } from "@/lib/queryClient";
import { Profile } from "@/types/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";


export const useCurrentProfile = (options?: Omit<UseQueryOptions<{ profile: Profile }, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: profileService.getCurrentProfile,
    ...options,
  });
};

export const useProfile = (
  userId: string,
  // options?: UseQueryOptions<{ profile: Profile }, Error>
  options?: Omit<UseQueryOptions<{ profile: Profile }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => profileService.getProfileByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};