<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
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
  if (password.value.length < 8) return 'Password must be at least 8 characters';
  return '';
});

const isValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value;
});

async function handleSubmit() {
  submitted.value = true;

  if (!isValid.value) return;

  const success = await authStore.register({
    email: email.value,
    password: password.value,
    firstName: firstName.value || undefined,
    lastName: lastName.value || undefined,
  });

  if (success) {
    router.push('/profile');
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Register</h1>

      <Message v-if="authStore.error" severity="error" :closable="false">
        {{ authStore.error }}
      </Message>

      <form @submit.prevent="handleSubmit" class="register-form">
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
            toggleMask
            :invalid="!!passwordError"
            :disabled="authStore.loading"
            fluid
          />
          <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
        </div>

        <div class="field">
          <label for="firstName">First Name (optional)</label>
          <InputText
            id="firstName"
            v-model="firstName"
            placeholder="Enter your first name"
            :disabled="authStore.loading"
            fluid
          />
        </div>

        <div class="field">
          <label for="lastName">Last Name (optional)</label>
          <InputText
            id="lastName"
            v-model="lastName"
            placeholder="Enter your last name"
            :disabled="authStore.loading"
            fluid
          />
        </div>

        <Button
          type="submit"
          label="Register"
          :loading="authStore.loading"
          :disabled="authStore.loading"
          fluid
        />
      </form>

      <p class="login-link">
        Already have an account?
        <RouterLink to="/login">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--p-surface-card);
  border-radius: var(--p-border-radius);
  box-shadow: var(--p-card-shadow);
}

.register-card h1 {
  margin: 0 0 1.5rem;
  text-align: center;
  color: var(--p-text-color);
}

.register-form {
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

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.login-link a {
  color: var(--p-primary-color);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
