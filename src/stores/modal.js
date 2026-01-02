// src/stores/modalStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const isLoginModalOpen = ref(false)
  const isMobileMenuOpen = ref(false)

  const toastMessage = ref(null)
  const isToastVisible = ref(false)
  const toastType = ref('success') // 'success', 'error', 'info'
  let toastTimer = null

  function openLoginModal() {
    isLoginModalOpen.value = true
  }
  function closeLoginModal() {
    isLoginModalOpen.value = false
  }
  function openMobileMenu() {
    isMobileMenuOpen.value = true
  }
  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  function showToast(message, type = 'success', duration = 3000) {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toastMessage.value = message
    toastType.value = type
    isToastVisible.value = true

    toastTimer = setTimeout(() => {
      isToastVisible.value = false
      toastMessage.value = null
      toastTimer = null
    }, duration)
  }

  return {
    isLoginModalOpen,
    isMobileMenuOpen,
    openLoginModal,
    closeLoginModal,
    openMobileMenu,
    closeMobileMenu,
    toastMessage,
    isToastVisible,
    toastType,
    showToast
  }
})
