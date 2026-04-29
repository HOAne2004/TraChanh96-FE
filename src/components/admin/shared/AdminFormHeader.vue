<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Lưu thay đổi' },
  hideSubmit: { type: Boolean, default: false },
  backLabel: { type: String, default: 'Hủy' },
  backRoute: { type: [String, Object], default: null },
})

const emit = defineEmits(['submit', 'back'])

const handleBack = () => {
  emit('back')
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <div class="flex gap-2 items-center">
      <button
        @click="handleBack"
        class="p-2 rounded-full border border-green-300 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-gray-100 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>
      <div>
        <h1 class="text-2xl text-green-600 dark-text-green-400 font-bold">
          {{ title }}
        </h1>
        <p v-if="description" class="text-sm text-gray-500">{{ description }}</p>
      </div>
    </div>
    <div class="flex gap-3">
      <slot name="actions">
        <button
          @click="handleBack"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
        >
          {{ backLabel }}
        </button>

        <button
          v-if="!hideSubmit"
          @click="$emit('submit')"
          :disabled="loading"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span
            v-if="loading"
            class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          ></span>
          {{ loading ? 'Đang lưu...' : submitLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>
