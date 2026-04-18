<template>
  <nav class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded-md flex items-center justify-center" style="background:#1D9E75">
        <svg class="w-4 h-4 text-white fill-white" viewBox="0 0 24 24">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2z"/>
        </svg>
      </div>
      <span class="font-medium text-gray-900 text-sm">SmartSeason</span>
    </div>

    <div class="flex items-center gap-6">
      <template v-if="auth.isAdmin">
        <RouterLink to="/admin/dashboard" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</RouterLink>
        <RouterLink to="/admin/fields" class="text-sm text-gray-600 hover:text-gray-900">Fields</RouterLink>
      </template>
      <template v-if="auth.isAgent">
        <RouterLink to="/agent/dashboard" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</RouterLink>
        <RouterLink to="/agent/fields" class="text-sm text-gray-600 hover:text-gray-900">My Fields</RouterLink>
      </template>

      <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
        <span class="text-sm text-gray-500">{{ auth.user?.name }}</span>
        <button
          @click="handleLogout"
          class="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-md px-3 py-1"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>