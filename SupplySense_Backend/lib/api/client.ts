import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Central API Client targeting FastAPI Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if exists in local storage / session
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('supplysense_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data cleanly or handle auth errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Log network/backend errors for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SupplySense API Client] HTTP ${error.response?.status || 'Network Error'} on ${error.config?.url}`, error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
