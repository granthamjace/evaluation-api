import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { User, RegisterData } from '@/types/auth';
import * as authApi from '@/api/auth.api';
import { TOKEN_KEY } from '@/api/client';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => token.value !== null && user.value !== null);

  const userFullName = computed(() => {
    if (!user.value) return '';
    if (user.value.firstName || user.value.lastName) {
      return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ');
    }
    return user.value.email;
  });

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    const response = await authApi.login({ email, password });

    loading.value = false;

    if (response.success && response.data) {
      token.value = response.data.tokens.accessToken;
      user.value = response.data.user;
      localStorage.setItem(TOKEN_KEY, token.value);
      return true;
    }

    error.value = response.error?.message || 'Login failed';
    return false;
  }

  async function register(data: RegisterData): Promise<boolean> {
    loading.value = true;
    error.value = null;

    const response = await authApi.register(data);

    loading.value = false;

    if (response.success && response.data) {
      token.value = response.data.tokens.accessToken;
      user.value = response.data.user;
      localStorage.setItem(TOKEN_KEY, token.value);
      return true;
    }

    error.value = response.error?.message || 'Registration failed';
    return false;
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    error.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  async function fetchUser(): Promise<void> {
    loading.value = true;
    error.value = null;

    const response = await authApi.getMe();

    loading.value = false;

    if (response.success && response.data) {
      user.value = response.data;
    } else {
      logout();
    }
  }

  function init(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      token.value = storedToken;
      fetchUser();
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userFullName,
    login,
    register,
    logout,
    fetchUser,
    init,
  };
});
