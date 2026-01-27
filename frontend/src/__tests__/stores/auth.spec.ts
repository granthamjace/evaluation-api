import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { TOKEN_KEY } from '@/api/client';
import type { User } from '@/types/auth';

vi.mock('@/api/auth.api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}));

import * as authApi from '@/api/auth.api';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('stores token in localStorage on success', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(localStorage.getItem(TOKEN_KEY)).toBe('test-token');
    });

    it('sets user state on success', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(store.user).toEqual(mockUser);
      expect(store.token).toBe('test-token');
    });

    it('returns true on success', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      const result = await store.login('test@example.com', 'password');

      expect(result).toBe(true);
    });

    it('sets error on failure', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'wrong-password');

      expect(store.error).toBe('Invalid credentials');
    });

    it('returns false on failure', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });

      const store = useAuthStore();
      const result = await store.login('test@example.com', 'wrong-password');

      expect(result).toBe(false);
    });

    it('does not store token on failure', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'wrong-password');

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears token from localStorage', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');
      store.logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('clears user state', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');
      store.logout();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
    });
  });

  describe('init', () => {
    it('fetches user if token exists in localStorage', async () => {
      localStorage.setItem(TOKEN_KEY, 'existing-token');
      vi.mocked(authApi.getMe).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const store = useAuthStore();
      store.init();

      expect(store.token).toBe('existing-token');
      expect(authApi.getMe).toHaveBeenCalled();
    });

    it('does nothing if no token in localStorage', () => {
      const store = useAuthStore();
      store.init();

      expect(store.token).toBeNull();
      expect(authApi.getMe).not.toHaveBeenCalled();
    });

    it('sets user after successful fetch', async () => {
      localStorage.setItem(TOKEN_KEY, 'existing-token');
      vi.mocked(authApi.getMe).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const store = useAuthStore();
      store.init();

      await vi.waitFor(() => {
        expect(store.user).toEqual(mockUser);
      });
    });

    it('logs out if fetch user fails', async () => {
      localStorage.setItem(TOKEN_KEY, 'invalid-token');
      vi.mocked(authApi.getMe).mockResolvedValue({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      });

      const store = useAuthStore();
      store.init();

      await vi.waitFor(() => {
        expect(store.token).toBeNull();
        expect(store.user).toBeNull();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token and user exist', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(store.isAuthenticated).toBe(true);
    });

    it('returns false when token is null', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('userFullName', () => {
    it('returns full name when firstName and lastName exist', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(store.userFullName).toBe('John Doe');
    });

    it('returns email when no name exists', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: { ...mockUser, firstName: null, lastName: null },
          tokens: { accessToken: 'test-token' },
        },
      });

      const store = useAuthStore();
      await store.login('test@example.com', 'password');

      expect(store.userFullName).toBe('test@example.com');
    });

    it('returns empty string when no user', () => {
      const store = useAuthStore();
      expect(store.userFullName).toBe('');
    });
  });
});
