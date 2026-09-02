/**
 * SupplySense — Zustand Authentication Store
 *
 * Replaces React Context for auth state management.
 * Handles signup, login, logout, token refresh, session restoration, and RBAC.
 */

import { create } from "zustand";
import apiClient, { setStoredAuth, clearStoredAuth, getStoredAuth } from "@/lib/api/client";
import type { UserResponse, UserRole, TokenResponse, SignupRequest } from "@/types/auth";
import type { BaseResponse } from "@/types/common";

interface AuthState {
  user: UserResponse | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  signup: (payload: SignupRequest) => Promise<TokenResponse>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  restoreSession: () => Promise<void>;
  hasRole: (requiredRole: string) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  signup: async (payload: SignupRequest) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post<BaseResponse<TokenResponse>>(
        "/auth/signup",
        payload
      );

      const data = response.data.data;
      const user: UserResponse = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
        employee_name: payload.full_name || data.username,
        warehouse_name: "Surat Central Warehouse",
      };

      setStoredAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("supplysense_user", JSON.stringify(user));
        document.cookie = `supplysense_authenticated=true; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `supplysense_role=${data.role || ""}; path=/; max-age=86400; SameSite=Lax`;
      }

      set({
        user,
        role: data.role,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post<BaseResponse<TokenResponse>>(
        "/auth/login",
        { username, password }
      );

      const data = response.data.data;
      const user: UserResponse = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
        employee_name: data.username,
        warehouse_name: "Surat Central Warehouse",
      };

      setStoredAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      // Also store user data for session restoration
      if (typeof window !== "undefined") {
        localStorage.setItem("supplysense_user", JSON.stringify(user));
        document.cookie = `supplysense_authenticated=true; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `supplysense_role=${data.role || ""}; path=/; max-age=86400; SameSite=Lax`;
      }

      set({
        user,
        role: data.role,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Logout even if API call fails
    } finally {
      clearStoredAuth();
      if (typeof window !== "undefined") {
        localStorage.removeItem("supplysense_user");
        localStorage.removeItem("supplysense_auth_tokens");
        localStorage.removeItem("supplysense_token");
        sessionStorage.clear();
        document.cookie = `supplysense_authenticated=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        document.cookie = `supplysense_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      set({
        user: null,
        role: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refreshAuth: async () => {
    const auth = getStoredAuth();
    if (!auth?.refreshToken) return;

    try {
      const response = await apiClient.post<BaseResponse<TokenResponse>>(
        "/auth/refresh",
        { refresh_token: auth.refreshToken }
      );

      const data = response.data.data;
      setStoredAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    } catch {
      clearStoredAuth();
      set({
        user: null,
        role: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  restoreSession: async () => {
    const auth = getStoredAuth();
    if (!auth?.accessToken) {
      set({ isHydrated: true });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await apiClient.get<BaseResponse<UserResponse>>("/auth/me");
      const user = response.data.data;

      set({
        user,
        role: user.role,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      // Update stored user
      if (typeof window !== "undefined") {
        localStorage.setItem("supplysense_user", JSON.stringify(user));
      }
    } catch {
      // Token invalid or expired — try refresh
      try {
        await get().refreshAuth();
        // Retry /me after refresh
        const retryResponse = await apiClient.get<BaseResponse<UserResponse>>("/auth/me");
        const user = retryResponse.data.data;
        const freshAuth = getStoredAuth();

        set({
          user,
          role: user.role,
          accessToken: freshAuth?.accessToken || null,
          refreshToken: freshAuth?.refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
      } catch {
        clearStoredAuth();
        if (typeof window !== "undefined") {
          localStorage.removeItem("supplysense_user");
        }
        set({
          user: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        });
      }
    }
  },

  hasRole: (requiredRole: string) => {
    const currentRole = get().role;
    return currentRole?.toLowerCase() === requiredRole.toLowerCase();
  },
}));
