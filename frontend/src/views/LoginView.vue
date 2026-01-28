<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const submitted = ref(false);

const emailError = computed(() => {
  if (!submitted.value) return '';
  if (!email.value) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) return 'Invalid email format';
  return '';
});

const passwordError = computed(() => {
  if (!submitted.value) return '';
  if (!password.value) return 'Password is required';
  return '';
});

const isValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value;
});

async function handleSubmit() {
  submitted.value = true;

  if (!isValid.value) return;

  const success = await authStore.login(email.value, password.value);

  if (success) {
    const redirect = route.query.redirect as string;
    router.push(redirect || '/profile');
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>

      <Message v-if="authStore.error" severity="error" :closable="false">
        {{ authStore.error }}
      </Message>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            :invalid="!!emailError"
            :disabled="authStore.loading"
            fluid
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :feedback="false"
            toggleMask
            :invalid="!!passwordError"
            :disabled="authStore.loading"
            fluid
          />
          <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
        </div>

        <Button
          type="submit"
          label="Login"
          :loading="authStore.loading"
          :disabled="authStore.loading"
          fluid
        />
      </form>

      <p class="register-link">
        Don't have an account?
        <RouterLink to="/register">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--p-surface-card);
  border-radius: var(--p-border-radius);
  box-shadow: var(--p-card-shadow);
}

.login-card h1 {
  margin: 0 0 1.5rem;
  text-align: center;
  color: var(--p-text-color);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
  color: var(--p-text-color);
}

.p-error {
  color: var(--p-red-500);
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.register-link a {
  color: var(--p-primary-color);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
