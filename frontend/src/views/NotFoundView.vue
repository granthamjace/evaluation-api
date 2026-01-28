<script setup lang="ts">
import Button from 'primevue/button';
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <p>Page not found</p>
      <p class="description">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/">
        <Button label="Go to Home" icon="pi pi-home" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.not-found-content {
  text-align: center;
}

.not-found-content h1 {
  font-size: 6rem;
  margin: 0;
  color: var(--p-primary-color);
  line-height: 1;
}

.not-found-content p {
  font-size: 1.5rem;
  margin: 0.5rem 0;
  color: var(--p-text-color);
}

.not-found-content .description {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin-bottom: 2rem;
}
</style>
