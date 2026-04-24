import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Reduced from 90s to 10s for dashboard requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate client for AI requests with longer timeout
export const aiApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptors to AI client as well
aiApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const errorData = error.response.data as any;
      return Promise.reject({
        message: errorData?.error?.message || 'An error occurred',
        code: errorData?.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response.status,
      });
    } else if (error.request) {
      const isTimeout = error.code === 'ECONNABORTED';
      return Promise.reject({
        message: isTimeout
          ? 'Request timed out — please try again.'
          : 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    } else {
      return Promise.reject({
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
      });
    }
  }
);

// Add same interceptors to AI client
aiApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const errorData = error.response.data as any;
      return Promise.reject({
        message: errorData?.error?.message || 'An error occurred',
        code: errorData?.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response.status,
      });
    } else if (error.request) {
      const isTimeout = error.code === 'ECONNABORTED';
      return Promise.reject({
        message: isTimeout
          ? 'AI request timed out — the AI is taking longer than expected. Please try again.'
          : 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    } else {
      return Promise.reject({
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
      });
    }
  }
);

export default apiClient;
