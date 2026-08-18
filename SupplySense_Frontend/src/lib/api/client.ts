/**
 * SupplySense — Production Axios API Client
 *
 * Features:
 * - Base URL from NEXT_PUBLIC_API_URL env
 * - Request interceptor: JWT token injection
 * - Response interceptor: BaseResponse envelope unwrap + 401 auto-refresh
 * - Error normalization via ApiError class
 * - Configurable timeout (15s default, 60s for AI)
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/types/common";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ──────────────────────────────────────────────
// Token storage helpers (for use outside React)
// ──────────────────────────────────────────────
const AUTH_STORAGE_KEY = "supplysense_auth";

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ──────────────────────────────────────────────
// Axios Instance
// ──────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ──────────────────────────────────────────────
// Request Interceptor — JWT Injection
// ──────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = getStoredAuth();
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    // Extend timeout for AI endpoints
    if (config.url?.includes("/ai/")) {
      config.timeout = 60_000;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────
// Response Interceptor — Envelope Unwrap + Refresh
// ──────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 — attempt silent token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const auth = getStoredAuth();
      if (auth?.refreshToken) {
        try {
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: auth.refreshToken,
          });

          const newTokens = refreshResponse.data?.data;
          if (newTokens?.access_token) {
            setStoredAuth({
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token,
            });

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
            }
            processQueue(null, newTokens.access_token);
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearStoredAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        clearStoredAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Normalize all errors into ApiError
    const status = error.response?.status || 500;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    let message = "An unexpected error occurred.";
    let code = "UNKNOWN_ERROR";

    if (responseData) {
      if (typeof responseData.detail === "string") {
        message = responseData.detail;
      } else if (responseData.error && typeof responseData.error === "object") {
        const err = responseData.error as Record<string, unknown>;
        message = (err.message as string) || message;
        code = (err.code as string) || code;
      } else if (typeof responseData.message === "string") {
        message = responseData.message;
      }
    }

    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please try again.";
      code = "TIMEOUT";
    }

    return Promise.reject(new ApiError(message, status, code));
  }
);

export default apiClient;
