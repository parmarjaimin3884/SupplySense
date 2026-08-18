/**
 * SupplySense — Settings React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { settingsApi } from "@/lib/api/settings";
import type { UserProfile, UserPreferences } from "@/types/settings";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.settings.profile,
    queryFn: settingsApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserProfile>) => settingsApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.profile });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.settings.preferences,
    queryFn: settingsApi.getPreferences,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserPreferences>) => settingsApi.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.preferences });
    },
  });
}
