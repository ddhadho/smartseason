<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#1D9E75">
          <svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2z"/>
          </svg>
        </div>
        <span class="font-medium text-gray-900">SmartSeason</span>
      </div>

      <h1 class="text-xl font-medium text-gray-900 mb-1">Sign in</h1>
      <p class="text-sm text-gray-500 mb-6">Field monitoring system</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@smartseason.com"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 rounded-lg text-sm font-medium text-white transition"
          style="background:#1D9E75"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-400 mb-1">Demo credentials</p>
        <p class="text-xs text-gray-500">Admin: admin@smartseason.com / admin123</p>
        <p class="text-xs text-gray-500">Agent: jane@smartseason.com / agent123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const user = await auth.login(email.value, password.value)
    router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/agent/dashboard')
  } catch {
    error.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>