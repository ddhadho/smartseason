<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="mb-8">
      <h1 class="text-xl font-medium text-gray-900">My Dashboard</h1>
      <p class="text-sm text-gray-500 mt-1">Your assigned fields this season</p>
    </div>

    <div v-if="loading" class="text-sm text-gray-400">Loading...</div>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">My fields</p>
          <p class="text-2xl font-medium text-gray-900">{{ summary.total }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Active</p>
          <p class="text-2xl font-medium text-green-700">{{ summary.active }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">At risk</p>
          <p class="text-2xl font-medium text-amber-600">{{ summary.atRisk }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Completed</p>
          <p class="text-2xl font-medium text-gray-500">{{ summary.completed }}</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-medium text-gray-900 mb-4">Stage breakdown</h2>
        <div class="space-y-3">
          <div v-for="(count, stage) in summary.byStage" :key="stage" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-20">{{ stage }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all"
                :style="{ width: barWidth(count) + '%', background: stageColor(stage) }"
              />
            </div>
            <span class="text-xs text-gray-700 w-4 text-right">{{ count }}</span>
          </div>
        </div>
      </div>

      <div v-if="summary.atRisk > 0" class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p class="text-sm font-medium text-amber-800">
          {{ summary.atRisk }} field{{ summary.atRisk > 1 ? 's' : '' }} need attention
        </p>
        <p class="text-xs text-amber-600 mt-1">
          Check your fields — some are stalled or overdue for harvest.
        </p>
        <RouterLink
          to="/agent/fields"
          class="inline-block mt-3 text-xs font-medium text-amber-800 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100"
        >
          View my fields
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../lib/axios'

const loading = ref(true)
const summary = ref({
  total: 0, active: 0, atRisk: 0, completed: 0,
  byStage: { PLANTED: 0, GROWING: 0, READY: 0, HARVESTED: 0 },
})

const stageColors = {
  PLANTED: '#378ADD',
  GROWING: '#1D9E75',
  READY: '#7F77DD',
  HARVESTED: '#888780',
}

function stageColor(stage) { return stageColors[stage] || '#888780' }
function barWidth(count) {
  const total = summary.value.total || 1
  return Math.round((count / total) * 100)
}

onMounted(async () => {
  try {
    const res = await api.get('/dashboard')
    summary.value = res.data.summary
  } finally {
    loading.value = false
  }
})
</script>