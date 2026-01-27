import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function show({ type = 'info', message, duration = 3000 }) {
    const id = Date.now()

    toasts.value.push({
      id,
      type, // success | error | warning | info
      message,
    })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  return {
    toasts,
    show,
    removeToast,
  }
})
