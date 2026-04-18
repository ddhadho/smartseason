<template>
  <div class="max-w-6xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-xl font-medium text-gray-900">Fields</h1>
        <p class="text-sm text-gray-500 mt-1">Manage and assign all fields</p>
      </div>
      <button
        @click="openCreate"
        class="text-sm font-medium text-white px-4 py-2 rounded-lg"
        style="background:#1D9E75"
      >
        Add field
      </button>
    </div>

    <div v-if="loading" class="text-sm text-gray-400">Loading...</div>

    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Field</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Crop</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Planted</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Stage</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Agent</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="field in fields" :key="field.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{{ field.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ field.cropType }}</td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(field.plantingDate) }}</td>
            <td class="px-4 py-3"><StageBadge :stage="field.stage" /></td>
            <td class="px-4 py-3"><StatusBadge :status="field.status" /></td>
            <td class="px-4 py-3 text-gray-500 text-xs">
              {{ agentName(field) || '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <button
                @click="openEdit(field)"
                class="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2 py-1 mr-2"
              >
                Edit
              </button>
              <button
                @click="handleDelete(field.id)"
                class="text-xs text-red-500 hover:text-red-700 border border-red-100 rounded px-2 py-1"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md">
        <h2 class="text-base font-medium text-gray-900 mb-5">
          {{ editing ? 'Edit field' : 'Add field' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Field name</label>
            <input
              v-model="form.name"
              required
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Crop type</label>
            <input
              v-model="form.cropType"
              required
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Planting date</label>
            <input
              v-model="form.plantingDate"
              type="date"
              required
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Assign agent</label>
            <select
              v-model="form.agentId"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Unassigned</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                {{ agent.name }}
              </option>
            </select>
          </div>

          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-2 rounded-lg text-sm font-medium text-white"
              style="background:#1D9E75"
            >
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 py-2 rounded-lg text-sm border border-gray-200 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
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
const agents = ref([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(null)
const submitting = ref(false)
const formError = ref('')

const form = ref({ name: '', cropType: '', plantingDate: '', agentId: '' })

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function agentName(field) {
  return field.assignments?.[0]?.agent?.name || null
}

function openCreate() {
  editing.value = null
  form.value = { name: '', cropType: '', plantingDate: '', agentId: '' }
  formError.value = ''
  showModal.value = true
}

function openEdit(field) {
  editing.value = field
  form.value = {
    name: field.name,
    cropType: field.cropType,
    plantingDate: field.plantingDate.split('T')[0],
    agentId: field.assignments?.[0]?.agent?.id || '',
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function fetchFields() {
  const res = await api.get('/fields')
  fields.value = res.data
}

async function fetchAgents() {
  const res = await api.get('/fields/agents')
  agents.value = res.data
}

async function handleSubmit() {
  submitting.value = true
  formError.value = ''
  try {
    const payload = {
      name: form.value.name,
      cropType: form.value.cropType,
      plantingDate: form.value.plantingDate,
      agentId: form.value.agentId || null,
    }
    if (editing.value) {
      await api.put(`/fields/${editing.value.id}`, payload)
    } else {
      await api.post('/fields', payload)
    }
    await fetchFields()
    closeModal()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Something went wrong'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this field?')) return
  await api.delete(`/fields/${id}`)
  await fetchFields()
}

onMounted(async () => {
  try {
    await Promise.all([fetchFields(), fetchAgents()])
  } finally {
    loading.value = false
  }
})
</script>