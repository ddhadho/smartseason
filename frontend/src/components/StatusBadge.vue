<template>
  <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="styles[status]">
    {{ status }}
  </span>
</template>

<script setup>
defineProps({ status: String })

const styles = {
  'Active': 'bg-green-100 text-green-800',
  'At Risk': 'bg-amber-100 text-amber-800',
  'Completed': 'bg-gray-100 text-gray-600',
}
</script>