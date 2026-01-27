import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import App from '../App.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/profile', component: { template: '<div>Profile</div>' } },
  ],
});

describe('App', () => {
  it('mounts and shows RouterView', async () => {
    setActivePinia(createPinia());
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router, PrimeVue],
        stubs: {
          Toast: true,
          Menubar: true,
        },
      },
    });

    expect(wrapper.find('main').exists()).toBe(true);
  });

  it('hides menu when not authenticated', async () => {
    setActivePinia(createPinia());
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router, PrimeVue],
        stubs: {
          Toast: true,
          Menubar: true,
        },
      },
    });

    expect(wrapper.find('header').exists()).toBe(false);
  });
});
