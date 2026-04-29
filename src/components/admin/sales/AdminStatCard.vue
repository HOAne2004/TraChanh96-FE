<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  iconPath: { type: String, required: true }, // SVG path
  color: { type: String, default: 'green' }, // green, yellow, blue, red
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'yellow':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
      }
    case 'blue':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
      }
    case 'red':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
      }
    case 'green':
    default:
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
      }
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-lg flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</p>
      <p class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{{ value }}</p>
      <p v-if="subtitle" class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ subtitle }}</p>
    </div>

    <div :class="['p-3 rounded-full', colorClasses.bg]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        :class="['w-8 h-8', colorClasses.text]"
      >
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
      </svg>
    </div>
  </div>
</template>
