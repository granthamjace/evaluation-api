<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Toast from 'primevue/toast';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

const menuItems = computed(() => [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/profile'),
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    command: () => router.push('/users'),
  },
]);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <Toast />

  <header v-if="authStore.isAuthenticated">
    <Menubar :model="menuItems">
      <template #start>
        <span class="app-name">Evaluation App</span>
      </template>
      <template #end>
        <div class="menu-end">
          <span class="user-name">{{ authStore.userFullName }}</span>
          <Button label="Logout" icon="pi pi-sign-out" severity="secondary" @click="handleLogout" />
        </div>
      </template>
    </Menubar>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.app-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-right: 1rem;
}

.menu-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: var(--p-text-muted-color);
}

main {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
