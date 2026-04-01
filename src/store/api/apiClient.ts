import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
      return Promise.reject({
        message: 'No response from server',
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
