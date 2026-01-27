<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useUsersStore } from '@/stores/users';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Tag from 'primevue/tag';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchUsers();
});

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  usersStore.setSearch(target.value);
};

const onPageChange = (event: { page: number }) => {
  usersStore.setPage(event.page + 1);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRoleSeverity = (role: string): 'success' | 'info' | 'warn' => {
  const severityMap: Record<string, 'success' | 'info' | 'warn'> = {
    ADMIN: 'success',
    MANAGER: 'warn',
    USER: 'info',
  };
  return severityMap[role] || 'info';
};

const paginatorFirst = computed(() => {
  return (usersStore.pagination.page - 1) * usersStore.pagination.pageSize;
});
</script>

<template>
  <div class="users-container">
    <div class="users-header">
      <h1>Users</h1>
      <div class="search-wrapper">
        <InputText
          :model-value="usersStore.searchQuery"
          placeholder="Search by name or email..."
          class="search-input"
          @input="onSearchInput"
        />
      </div>
    </div>

    <Message v-if="usersStore.error" severity="error" :closable="false">
      {{ usersStore.error }}
    </Message>

    <div v-if="usersStore.loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <template v-else-if="!usersStore.error">
      <DataTable :value="usersStore.users" class="users-table" striped-rows>
        <Column field="email" header="Email" />
        <Column field="firstName" header="First Name">
          <template #body="{ data }">
            {{ data.firstName || '-' }}
          </template>
        </Column>
        <Column field="lastName" header="Last Name">
          <template #body="{ data }">
            {{ data.lastName || '-' }}
          </template>
        </Column>
        <Column field="role" header="Role">
          <template #body="{ data }">
            <Tag :value="data.role" :severity="getRoleSeverity(data.role)" />
          </template>
        </Column>
        <Column field="createdAt" header="Created">
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>
        <template #empty>
          <div class="empty-message">No users found.</div>
        </template>
      </DataTable>

      <Paginator
        v-if="usersStore.pagination.totalPages > 1"
        :rows="usersStore.pagination.pageSize"
        :total-records="usersStore.pagination.total"
        :first="paginatorFirst"
        @page="onPageChange"
      />
    </template>
  </div>
</template>

<style scoped>
.users-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.users-header h1 {
  margin: 0;
  color: var(--p-text-color);
}

.search-wrapper {
  width: 100%;
  max-width: 300px;
}

.search-input {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.users-table {
  margin-bottom: 1rem;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--p-text-muted-color);
}

@media (max-width: 768px) {
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    max-width: none;
  }
}
</style>
