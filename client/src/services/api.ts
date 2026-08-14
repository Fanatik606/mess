import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../utils/constants';

/**
 * Shared axios instance. Attaches the JWT from localStorage on every request
 * and normalizes error responses into a readable message.
 */
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Doesn't retry on 401; auth hook handles logout/redirect.
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Extracts a friendly message from any thrown axios error. */
export function toErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message === 'Network Error') {
      return 'Нет соединения с сервером';
    }
    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}