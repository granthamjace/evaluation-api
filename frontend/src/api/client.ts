import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearTokenAndRedirect(): void {
  localStorage.removeItem(TOKEN_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    clearTokenAndRedirect();
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Session expired' },
    };
  }

  const data: ApiResponse<T> = await response.json();
  return data;
}

export const apiClient = {
  get<T>(path: string, query?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('GET', path, undefined, query);
  },

  post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body);
  },

  patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body);
  },

  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path);
  },
};

export { TOKEN_KEY };
