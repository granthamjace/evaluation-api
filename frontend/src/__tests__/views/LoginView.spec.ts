import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import LoginView from '@/views/LoginView.vue';
import { useAuthStore } from '@/stores/auth';

vi.mock('@/api/auth.api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}));

import * as authApi from '@/api/auth.api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/profile', component: { template: '<div>Profile</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
  ],
});

function mountLoginView() {
  return mount(LoginView, {
    global: {
      plugins: [router, PrimeVue],
      stubs: {
        Message: {
          template: '<div class="message-stub" data-testid="error-message"><slot /></div>',
          props: ['severity', 'closable'],
        },
        InputText: {
          template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :disabled="disabled" data-testid="input-text" />',
          props: ['id', 'modelValue', 'disabled', 'invalid', 'fluid', 'type', 'placeholder'],
          emits: ['update:modelValue'],
        },
        Password: {
          template: '<input :id="id" type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :disabled="disabled" data-testid="password-input" />',
          props: ['id', 'modelValue', 'disabled', 'invalid', 'fluid', 'feedback', 'toggleMask', 'placeholder'],
          emits: ['update:modelValue'],
        },
        Button: {
          template: '<button :type="type" :disabled="disabled || loading" data-testid="submit-button"><span v-if="loading" class="loading-indicator"></span>{{ label }}</button>',
          props: ['type', 'label', 'loading', 'disabled', 'fluid'],
        },
      },
    },
  });
}

describe('LoginView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    await router.push('/login');
    await router.isReady();
  });

  describe('rendering', () => {
    it('renders email input', () => {
      const wrapper = mountLoginView();
      const emailInput = wrapper.find('#email');
      expect(emailInput.exists()).toBe(true);
    });

    it('renders password input', () => {
      const wrapper = mountLoginView();
      const passwordInput = wrapper.find('#password');
      expect(passwordInput.exists()).toBe(true);
    });

    it('renders submit button', () => {
      const wrapper = mountLoginView();
      const submitButton = wrapper.find('[data-testid="submit-button"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toContain('Login');
    });

    it('renders link to register page', () => {
      const wrapper = mountLoginView();
      const registerLink = wrapper.find('a[href="/register"]');
      expect(registerLink.exists()).toBe(true);
    });
  });

  describe('error display', () => {
    it('shows error message when login fails', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });

      const wrapper = mountLoginView();
      const authStore = useAuthStore();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#password').setValue('wrongpassword');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(authStore.error).toBe('Invalid email or password');
      expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('Invalid email or password');
    });

    it('does not show error message initially', () => {
      const wrapper = mountLoginView();
      expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(false);
    });
  });

  describe('loading state', () => {
    it('shows loading state on submit', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authApi.login).mockReturnValue(loginPromise as ReturnType<typeof authApi.login>);

      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#password').setValue('password123');

      const submitPromise = wrapper.find('form').trigger('submit');
      await flushPromises();

      const authStore = useAuthStore();
      expect(authStore.loading).toBe(true);

      const button = wrapper.find('[data-testid="submit-button"]');
      expect(button.attributes('disabled')).toBeDefined();

      resolveLogin!({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', firstName: null, lastName: null, role: 'USER', createdAt: '', updatedAt: '' },
          tokens: { accessToken: 'test-token' },
        },
      });

      await submitPromise;
      await flushPromises();
    });

    it('disables inputs during loading', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authApi.login).mockReturnValue(loginPromise as ReturnType<typeof authApi.login>);

      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#password').setValue('password123');

      wrapper.find('form').trigger('submit');
      await flushPromises();

      const emailInput = wrapper.find('#email');
      const passwordInput = wrapper.find('#password');
      expect(emailInput.attributes('disabled')).toBeDefined();
      expect(passwordInput.attributes('disabled')).toBeDefined();

      resolveLogin!({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', firstName: null, lastName: null, role: 'USER', createdAt: '', updatedAt: '' },
          tokens: { accessToken: 'test-token' },
        },
      });

      await flushPromises();
    });
  });

  describe('redirect on success', () => {
    it('redirects to /profile on successful login', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', firstName: null, lastName: null, role: 'USER', createdAt: '', updatedAt: '' },
          tokens: { accessToken: 'test-token' },
        },
      });

      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#password').setValue('password123');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/profile');
    });

    it('redirects to query redirect param when present', async () => {
      await router.push('/login?redirect=/dashboard');
      await router.isReady();

      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', firstName: null, lastName: null, role: 'USER', createdAt: '', updatedAt: '' },
          tokens: { accessToken: 'test-token' },
        },
      });

      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('#password').setValue('password123');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('validation', () => {
    it('shows email error when email is empty on submit', async () => {
      const wrapper = mountLoginView();

      await wrapper.find('#password').setValue('password123');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.text()).toContain('Email is required');
    });

    it('shows password error when password is empty on submit', async () => {
      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('test@example.com');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.text()).toContain('Password is required');
    });

    it('shows invalid email format error', async () => {
      const wrapper = mountLoginView();

      await wrapper.find('#email').setValue('invalid-email');
      await wrapper.find('#password').setValue('password123');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.text()).toContain('Invalid email format');
    });

    it('does not call login API with invalid form', async () => {
      const wrapper = mountLoginView();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(authApi.login).not.toHaveBeenCalled();
    });
  });
});
