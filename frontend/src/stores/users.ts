import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '@/types/auth';
import type { PaginationMeta } from '@/types/api';
import * as usersApi from '@/api/users.api';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const searchQuery = ref('');

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function fetchUsers(params?: { page?: number; search?: string }): Promise<void> {
    loading.value = true;
    error.value = null;

    const response = await usersApi.list({
      page: params?.page ?? pagination.value.page,
      pageSize: pagination.value.pageSize,
      search: params?.search ?? (searchQuery.value || undefined),
    });

    loading.value = false;

    if (response.success && response.data) {
      users.value = response.data;
      if (response.meta) {
        pagination.value = response.meta;
      }
    } else {
      error.value = response.error?.message || 'Failed to load users';
    }
  }

  function setPage(page: number): void {
    pagination.value.page = page;
    fetchUsers({ page });
  }

  function setSearch(search: string): void {
    searchQuery.value = search;

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      pagination.value.page = 1;
      fetchUsers({ page: 1, search });
    }, 300);
  }

  return {
    users,
    loading,
    error,
    pagination,
    searchQuery,
    fetchUsers,
    setPage,
    setSearch,
  };
});
