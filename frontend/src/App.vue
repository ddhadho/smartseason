<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar v-if="auth.isAuthenticated" />
    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

const auth = useAuthStore()
</script>