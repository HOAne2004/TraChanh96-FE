<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

function typeClass(type) {
  const baseClasses = 'border-l-4 backdrop-blur-sm '

  switch (type) {
    case 'success':
      return baseClasses + 'bg-gradient-to-r from-green-500/95 to-green-600/95 border-green-700'
    case 'error':
      return baseClasses + 'bg-gradient-to-r from-red-500/95 to-red-600/95 border-red-700'
    case 'warning':
      return (
        baseClasses +
        'bg-gradient-to-r from-yellow-500/95 to-yellow-600/95 border-yellow-700 text-gray-900'
      )
    default:
      return baseClasses + 'bg-gradient-to-r from-blue-500/95 to-blue-600/95 border-blue-700'
  }
}

function removeToast(id) {
  toastStore.removeToast(id)
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-3">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[300px] max-w-md text-white border-l-4 transform transition-all duration-300 ease-out backdrop-blur-sm"
        :class="typeClass(toast.type)"
      >
        <div class="flex items-center gap-3 flex-1">
          <!-- Icon tương ứng với loại toast -->
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- Nội dung toast -->
          <div class="flex-1">
            <p class="text-sm font-medium leading-tight">{{ toast.message }}</p>
            <p v-if="toast.duration" class="text-xs opacity-80 mt-1">
              Tự đóng sau {{ Math.round(toast.duration / 2000) }}s
            </p>
          </div>
        </div>

        <!-- Nút đóng -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors"
          aria-label="Đóng thông báo"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Animation cho toast */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.4s;
}
</style>
