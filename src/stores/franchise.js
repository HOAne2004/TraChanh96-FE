import { defineStore } from 'pinia'
import { ref } from 'vue'
import franchiseService from '@/services/franchise.service'

export const useFranchiseStore = defineStore('franchise', () => {
  // --- STATE ---
  const requests = ref([])
  const currentRequest = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * [PUBLIC] Gửi yêu cầu nhượng quyền
   */
  async function submitFranchiseRequest(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await franchiseService.create(payload)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Gửi yêu cầu thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN/MANAGER] Lấy danh sách yêu cầu
   */
  async function fetchRequests(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await franchiseService.getAll(filters)
      requests.value = res.data
    } catch (err) {
      error.value = 'Không thể tải danh sách nhượng quyền'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN/MANAGER] Lấy chi tiết yêu cầu
   */
  async function fetchRequestById(id) {
    loading.value = true
    error.value = null
    try {
      const res = await franchiseService.getById(id)
      currentRequest.value = res.data
    } catch (err) {
      error.value = 'Không tìm thấy yêu cầu'
      currentRequest.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN/MANAGER] Cập nhật yêu cầu
   */
  async function updateRequest(id, payload) {
    loading.value = true
    error.value = null
    try {
      const res = await franchiseService.update(id, payload)

      // Update list
      const index = requests.value.findIndex(r => r.id === id)
      if (index !== -1) {
        requests.value[index] = res.data
      }

      // Update detail
      if (currentRequest.value?.id === id) {
        currentRequest.value = res.data
      }

      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Xóa yêu cầu
   */
  async function deleteRequest(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return

    loading.value = true
    error.value = null
    try {
      await franchiseService.delete(id)
      requests.value = requests.value.filter(r => r.id !== id)
    } catch (err) {
      error.value = 'Xóa yêu cầu thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    requests,
    currentRequest,
    loading,
    error,
    submitFranchiseRequest,
    fetchRequests,
    fetchRequestById,
    updateRequest,
    deleteRequest,
  }
})
