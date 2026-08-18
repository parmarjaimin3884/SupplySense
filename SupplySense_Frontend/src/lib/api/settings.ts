/**
 * SupplySense — Settings API Service
 */

import apiClient from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { UserProfile, UserPreferences } from "@/types/settings";

export const settingsApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<BaseResponse<UserProfile>>("/settings/profile");
    return response.data.data;
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put<BaseResponse<UserProfile>>("/settings/profile", payload);
    return response.data.data;
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<BaseResponse<UserPreferences>>("/settings/preferences");
    return response.data.data;
  },

  updatePreferences: async (payload: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await apiClient.put<BaseResponse<UserPreferences>>("/settings/preferences", payload);
    return response.data.data;
  },
};
