<template>
  <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="styles[stage]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ stage: String })

const styles = {
  PLANTED: 'bg-blue-100 text-blue-800',
  GROWING: 'bg-teal-100 text-teal-800',
  READY: 'bg-purple-100 text-purple-800',
  HARVESTED: 'bg-gray-100 text-gray-600',
}

const labels = {
  PLANTED: 'Planted', GROWING: 'Growing', READY: 'Ready', HARVESTED: 'Harvested',
}

const label = computed(() => labels[props.stage] || props.stage)
</script>