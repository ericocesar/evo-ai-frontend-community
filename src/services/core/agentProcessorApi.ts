import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { applySetupInterceptor } from '@/services/core/setupInterceptor';
import apiAuth from '@/services/core/apiAuth';
import {
  isRefreshing as sharedIsRefreshing,
  setIsRefreshing,
  failedQueue as sharedFailedQueue,
  processQueue,
} from '@/services/core/tokenRefresh';

// Criar instância do axios específica para a API do Agent Processor
const agentProcessorApi = axios.create({
  baseURL: `${import.meta.env.VITE_AGENT_PROCESSOR_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar headers específicos para o Agent Processor
agentProcessorApi.interceptors.request.use(config => {
  // Adicionar token de autenticação
  const authHeader = useAuthStore.getState().getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader.Authorization;
  }

  return config;
});

// Interceptador para tratar respostas e erros
agentProcessorApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // On 401, attempt a token refresh and retry — same pattern as api.ts
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (sharedIsRefreshing) {
        // Another axios instance is already refreshing — queue this request
        return new Promise((resolve, reject) => {
          sharedFailedQueue.push({ resolve, reject });
        })
          .then(() => {
            const authHeader = useAuthStore.getState().getAuthHeader();
            if (authHeader && originalRequest.headers) {
              originalRequest.headers.Authorization = authHeader.Authorization;
            }
            return agentProcessorApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      setIsRefreshing(true);

      try {
        const refreshResponse = await apiAuth.post('/auth/refresh');
        const refreshData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = refreshData?.access_token || refreshData?.token?.access_token;

        if (!newAccessToken) {
          throw new Error('New token not received');
        }

        useAuthStore.getState().setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        setIsRefreshing(false);
        return agentProcessorApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setIsRefreshing(false);
        // Don't terminate session here — api.ts interceptor handles that
        return Promise.reject(refreshError);
      }
    }

    const detail =
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Unknown error';
    console.error('Agent Processor API Error:', detail, { status: error?.response?.status });
    return Promise.reject(error);
  },
);

applySetupInterceptor(agentProcessorApi);

export { agentProcessorApi };
export default agentProcessorApi;

