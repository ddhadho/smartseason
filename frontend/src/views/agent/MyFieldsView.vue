<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="mb-8">
      <h1 class="text-xl font-medium text-gray-900">My Fields</h1>
      <p class="text-sm text-gray-500 mt-1">Update stages and log observations</p>
    </div>

    <div v-if="loading" class="text-sm text-gray-400">Loading...</div>

    <div v-else class="space-y-4">
      <div
        v-for="field in fields"
        :key="field.id"
        class="bg-white border border-gray-200 rounded-xl p-5"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h2 class="text-sm font-medium text-gray-900">{{ field.name }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ field.cropType }} · Planted {{ formatDate(field.plantingDate) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <StageBadge :stage="field.stage" />
            <StatusBadge :status="field.status" />
          </div>
        </div>

        <div v-if="field.updates?.[0]" class="mb-4 bg-gray-50 rounded-lg px-3 py-2">
          <p class="text-xs text-gray-500 mb-0.5">Last update · {{ formatDate(field.updates[0].createdAt) }}</p>
          <p class="text-xs text-gray-700">{{ field.updates[0].notes || 'No notes' }}</p>
        </div>

        <div
          v-if="activeField === field.id"
          class="border-t border-gray-100 pt-4 mt-2"
        >
          <form @submit.prevent="submitUpdate(field.id)" class="space-y-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Update stage</label>
              <select
                v-model="updateForm.stage"
                required
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select stage</option>
                <option value="PLANTED">Planted</option>
                <option value="GROWING">Growing</option>
                <option value="READY">Ready</option>
                <option value="HARVESTED">Harvested</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Notes / observations</label>
              <textarea
                v-model="updateForm.notes"
                rows="2"
                placeholder="What did you observe in the field?"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <p v-if="updateError" class="text-xs text-red-600">{{ updateError }}</p>
            <div class="flex gap-2">
              <button
                type="submit"
                :disabled="submitting"
                class="text-sm font-medium text-white px-4 py-2 rounded-lg"
                style="background:#1D9E75"
              >
                {{ submitting ? 'Saving...' : 'Save update' }}
              </button>
              <button
                type="button"
                @click="activeField = null"
                class="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div v-else class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            @click="openUpdate(field)"
            class="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:border-gray-300"
          >
            Log update
          </button>
          <button
            @click="toggleHistory(field.id)"
            class="text-xs text-gray-400 hover:text-gray-600"
          >
            {{ showHistory === field.id ? 'Hide history' : 'View history' }}
          </button>
        </div>

        <div v-if="showHistory === field.id" class="mt-4 space-y-2">
          <div v-if="loadingHistory" class="text-xs text-gray-400">Loading...</div>
          <template v-else>
            <div v-if="history.length === 0" class="text-xs text-gray-400">No updates yet.</div>
            <div
              v-for="entry in history"
              :key="entry.id"
              class="flex gap-3 text-xs"
            >
              <span class="text-gray-400 whitespace-nowrap">{{ formatDate(entry.createdAt) }}</span>
              <StageBadge :stage="entry.stage" />
              <span class="text-gray-600">{{ entry.notes || '—' }}</span>
            </div>
          </template>
        </div>
      </div>

      <div v-if="fields.length === 0" class="text-sm text-gray-400 text-center py-12">
        No fields assigned to you yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../lib/axios'
import StatusBadge from '../../components/StatusBadge.vue'
import StageBadge from '../../components/StageBadge.vue'

const fields = ref([])
const loading = ref(true)
const activeField = ref(null)
const showHistory = ref(null)
const history = ref([])
const loadingHistory = ref(false)
const submitting = ref(false)
const updateError = ref('')

const updateForm = ref({ stage: '', notes: '' })

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openUpdate(field) {
  activeField.value = field.id
  updateForm.value = { stage: field.stage, notes: '' }
  updateError.value = ''
  showHistory.value = null
}

async function toggleHistory(fieldId) {
  if (showHistory.value === fieldId) {
    showHistory.value = null
    return
  }
  showHistory.value = fieldId
  loadingHistory.value = true
  try {
    const res = await api.get(`/fields/${fieldId}/updates`)
    history.value = res.data
  } finally {
    loadingHistory.value = false
  }
}

async function submitUpdate(fieldId) {
  submitting.value = true
  updateError.value = ''
  try {
    await api.post(`/fields/${fieldId}/updates`, {
      stage: updateForm.value.stage,
      notes: updateForm.value.notes,
    })
    const res = await api.get('/fields/my')
    fields.value = res.data
    activeField.value = null
  } catch (e) {
    updateError.value = e.response?.data?.error || 'Something went wrong'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/fields/my')
    fields.value = res.data
  } finally {
    loading.value = false
  }
})
</script>