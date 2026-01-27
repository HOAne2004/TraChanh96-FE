import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const isVisible = ref(false)
  const modalConfig = reactive({
    type: 'info',
    title: 'Xác nhận',
    message: '',
    subtitle: '',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    showCancelButton: true,
    backdropClose: true,
    escClose: true
  })

  // Resolver promise
  let resolvePromise = null

  function show(config = {}) {
    // Update modal configuration
    Object.assign(modalConfig, config)
    isVisible.value = true

    // Return a promise that resolves when user makes a choice
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function hide() {
    isVisible.value = false
  }

  function confirm() {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    hide()
  }

  function cancel() {
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
    hide()
  }

  // Helper methods for common modal types
  function confirmDelete(message = 'Bạn có chắc chắn muốn xóa mục này?') {
    return show({
      type: 'error',
      title: 'Xác nhận xóa',
      message,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    })
  }

  function confirmAction(message, title = 'Xác nhận thao tác') {
    return show({
      type: 'warning',
      title,
      message,
      confirmButtonText: 'Tiếp tục',
      cancelButtonText: 'Hủy'
    })
  }

  function showSuccess(message, title = 'Thành công') {
    return show({
      type: 'success',
      title,
      message,
      showCancelButton: false,
      confirmButtonText: 'OK'
    })
  }

  function showError(message, title = 'Lỗi') {
    return show({
      type: 'error',
      title,
      message,
      showCancelButton: false,
      confirmButtonText: 'OK'
    })
  }

  return {
    isVisible,
    modalConfig,
    show,
    hide,
    confirm,
    cancel,
    confirmDelete,
    confirmAction,
    showSuccess,
    showError
  }
})
