import { defineStore } from 'pinia'
import { ref } from 'vue'
import paymentMethodService from '@/services/paymentMethod.service'
import { useToastStore } from '@/stores/toast'
export const usePaymentMethodStore = defineStore('paymentMethod', () => {
  // State
  const activeMethods = ref([]) // Dùng cho khách hàng (Checkout)
  const allMethods = ref([]) // Dùng cho Admin
  const loading = ref(false)
  const error = ref(null)
  const toastStore = useToastStore()

  // --- ACTIONS ---

  /**
   * [PUBLIC] Lấy danh sách cho trang Checkout
   */
  async function fetchActiveMethods() {
    loading.value = true
    error.value = null
    try {
      const res = await paymentMethodService.getActive()
      activeMethods.value = res.data
    } catch (err) {
      console.error('Lỗi tải phương thức thanh toán:', err)
      toastStore.show({ message: 'Không thể tải phương thức thanh toán', type: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Lấy toàn bộ danh sách quản lý
   */
  async function fetchAllMethods() {
    loading.value = true
    try {
      const res = await paymentMethodService.getAll()
      allMethods.value = res.data
    } catch (err) {
      toastStore.show({ message: 'Không thể tải danh sách', type: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo mới
   */
  async function createMethod(payload) {
    loading.value = true
    try {
      const res = await paymentMethodService.create(payload)
      allMethods.value.push(res.data) // Cập nhật ngay vào list admin
      return true
    } catch (err) {
      toastStore.show({ message: 'Lỗi tạo mới', type: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Cập nhật
   */
  async function updateMethod(id, payload) {
    loading.value = true
    try {
      const res = await paymentMethodService.update(id, payload)
      // Tìm và update trong mảng local
      const index = allMethods.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        allMethods.value[index] = res.data
      }
      return true
    } catch (err) {
      toastStore.show({ message: 'Lỗi cập nhật', type: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Bật/Tắt trạng thái
   */
  async function toggleStatus(id) {
    try {
      await paymentMethodService.toggleStatus(id)
      // Update local state (đảo ngược status)
      const method = allMethods.value.find((m) => m.id === id)
      if (method) {
        method.status = method.status === 'Active' ? 'Inactive' : 'Active'
      }
    } catch (err) {
      toastStore.show({ message: 'Lỗi bật/tắt trạng thái', type: 'error' })
    }
  }

  return {
    activeMethods,
    allMethods,
    loading,
    fetchActiveMethods,
    fetchAllMethods,
    createMethod,
    updateMethod,
    toggleStatus,
  }
})
