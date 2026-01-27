<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Card from 'primevue/card';
import Tag from 'primevue/tag';

const authStore = useAuthStore();

const userName = computed(() => {
  if (!authStore.user) return '';
  const { firstName, lastName } = authStore.user;
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }
  return '-';
});

const formattedDate = computed(() => {
  if (!authStore.user?.createdAt) return '';
  return new Date(authStore.user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const roleSeverity = computed(() => {
  if (!authStore.user) return undefined;
  const severityMap: Record<string, 'success' | 'info' | 'warn'> = {
    ADMIN: 'success',
    MANAGER: 'warn',
    USER: 'info',
  };
  return severityMap[authStore.user.role] || 'info';
});
</script>

<template>
  <div class="profile-container">
    <Card class="profile-card">
      <template #title>Profile</template>
      <template #content>
        <div v-if="authStore.user" class="profile-fields">
          <div class="profile-field">
            <span class="field-label">Email:</span>
            <span class="field-value">{{ authStore.user.email }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">Name:</span>
            <span class="field-value">{{ userName }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">Role:</span>
            <span class="field-value">
              <Tag :value="authStore.user.role" :severity="roleSeverity" />
            </span>
          </div>
          <div class="profile-field">
            <span class="field-label">Since:</span>
            <span class="field-value">{{ formattedDate }}</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.profile-card {
  width: 100%;
  max-width: 500px;
}

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-field {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.field-label {
  min-width: 80px;
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.field-value {
  color: var(--p-text-color);
}
</style>
