import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';
import { apiClient } from './client';

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function list(params?: ListUsersParams): Promise<ApiResponse<User[]>> {
  const query: Record<string, string> = {};
  if (params?.page !== undefined) {
    query.page = params.page.toString();
  }
  if (params?.pageSize !== undefined) {
    query.pageSize = params.pageSize.toString();
  }
  if (params?.search) {
    query.search = params.search;
  }
  return apiClient.get('/users', query);
}
