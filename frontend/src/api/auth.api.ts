import type { ApiResponse } from '@/types/api';
import type { User, AuthTokens, RegisterData, LoginData } from '@/types/auth';
import { apiClient } from './client';

export async function register(
  data: RegisterData,
): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return apiClient.post('/auth/register', data);
}

export async function login(
  data: LoginData,
): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return apiClient.post('/auth/login', data);
}

export async function getMe(): Promise<ApiResponse<User>> {
  return apiClient.get('/auth/me');
}
