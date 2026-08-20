import apiClient from "./client";
import { BaseResponse } from "@/types/common";
import { UserListItem, CreateUserPayload } from "@/types/auth";

export const fetchWorkspaceUsers = async (): Promise<UserListItem[]> => {
  const response = await apiClient.get<BaseResponse<UserListItem[]>>("/auth/users");
  return response.data.data || [];
};

export const createWorkspaceUser = async (payload: CreateUserPayload): Promise<UserListItem> => {
  const response = await apiClient.post<BaseResponse<UserListItem>>("/auth/users", payload);
  return response.data.data;
};

export const deleteWorkspaceUser = async (userId: string): Promise<void> => {
  await apiClient.delete<BaseResponse<{ deleted_user_id: string }>>(`/auth/users/${userId}`);
};
