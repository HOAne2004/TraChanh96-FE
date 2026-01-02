// src/stores/policy.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import policyService from '@/services/policy.service'

export const usePolicyStore = defineStore('policy', () => {
  // --- STATE ---
  const activePolicies = ref([]) // List cho Footer/Menu (Khách hàng)
  const adminPolicies = ref([])  // List cho trang Quản lý (Admin)
  const currentPolicy = ref(null)// Nội dung chi tiết bài viết (dùng cho cả xem và edit)

  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * [Public] Lấy danh sách menu chính sách
   */
  async function fetchActivePolicies(params = { brandId: 1 }) {
    // Không set loading toàn trang để tránh nháy khi load footer
    try {
      const response = await policyService.getActive(params)
      activePolicies.value = response.data
    } catch (err) {
      console.error('Lỗi tải menu chính sách:', err)
    }
  }

  /**
   * [Public] Lấy nội dung bài viết theo Slug
   * @param {string} slug - VD: 'chinh-sach-bao-mat'
   */
  async function fetchPolicyBySlug(slug) {
    loading.value = true
    error.value = null
    currentPolicy.value = null
    try {
      const response = await policyService.getBySlug(slug)
      currentPolicy.value = response.data
      return response.data
    } catch (err) {
      // Nếu 404 thì component sẽ handle hiển thị trang Not Found
      error.value = err.response?.data || 'Không tìm thấy nội dung'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Lấy danh sách quản trị
   */
  async function fetchAdminPolicies(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await policyService.getAllAdmin(params)
      adminPolicies.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải dữ liệu quản trị'
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Tạo chính sách
   */
  async function createPolicyAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await policyService.create(createDto)
      // Tạo xong reload lại list Admin
      await fetchAdminPolicies({ brandId: createDto.brandId })
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo chính sách thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Cập nhật chính sách
   */
  async function updatePolicyAction(id, updateDto, currentParams = {}) {
    loading.value = true
    error.value = null
    try {
      await policyService.update(id, updateDto)
      await fetchAdminPolicies(currentParams)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Xóa chính sách
   */
  async function deletePolicyAction(id, currentParams = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return

    loading.value = true
    error.value = null
    try {
      await policyService.delete(id)
      await fetchAdminPolicies(currentParams)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    activePolicies,
    adminPolicies,
    currentPolicy,
    loading,
    error,
    fetchActivePolicies,
    fetchPolicyBySlug,
    fetchAdminPolicies,
    createPolicyAction,
    updatePolicyAction,
    deletePolicyAction
  }
})
