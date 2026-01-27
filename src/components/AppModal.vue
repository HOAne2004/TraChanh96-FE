<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: [String, Object],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  confirmButtonText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelButtonText: {
    type: String,
    default: 'Hủy'
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  backdropClose: {
    type: Boolean,
    default: true
  },
  escClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

// Computed classes
const modalClasses = computed(() => {
  if (props.type === 'warning') return 'border-t-4 border-yellow-500'
  return ''
})

const headerClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20'
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20'
    default:
      return 'bg-blue-50 dark:bg-blue-900/20'
  }
})

const iconContainerClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500'
    case 'error':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-blue-500'
  }
})

const confirmButtonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-600 hover:bg-green-700'
    case 'error':
      return 'bg-red-600 hover:bg-red-700'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700'
    default:
      return 'bg-blue-600 hover:bg-blue-700'
  }
})

const cancelButtonClasses = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
    default:
      return ''
  }
})

// Handlers
function handleConfirm() {
  emit('confirm')
  emit('close')
}

function handleCancel() {
  emit('cancel')
  emit('close')
}

function handleBackdropClick() {
  if (props.backdropClose) {
    emit('cancel')
    emit('close')
  }
}

// Keyboard events
function handleKeydown(event) {
  if (props.escClose && event.key === 'Escape' && props.isVisible) {
    handleCancel()
  }
}

// Setup keyboard listener
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="handleBackdropClick"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
        :class="modalClasses"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-6 border-b dark:border-gray-700"
          :class="headerClasses"
        >
          <div class="flex items-center gap-3">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="iconContainerClasses"
            >
              <svg
                v-if="type === 'success'"
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else-if="type === 'error'"
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else-if="type === 'warning'"
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Title -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="text-gray-700 dark:text-gray-300">
            <div v-if="typeof message === 'string'" v-html="message" class="prose max-w-none"></div>
      <div v-else v-html="message"></div>
          </div>
        </div>

        <!-- Footer - Action Buttons -->
        <div class="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
          <!-- Cancel Button -->
          <button
            v-if="showCancelButton"
            @click="handleCancel"
            class="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
                   border border-gray-300 dark:border-gray-600
                   text-gray-700 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="cancelButtonClasses"
          >
            {{ cancelButtonText }}
          </button>

          <!-- Confirm Button -->
          <button
            @click="handleConfirm"
            class="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors text-white"
            :class="confirmButtonClasses"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.95) translateY(-10px);
}

.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}
</style>
