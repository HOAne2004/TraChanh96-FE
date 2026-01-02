// src/stores/staff.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import staffService from '@/services/staff.service'

export const useStaffStore = defineStore('staff', () => {
  // --- STATE ---
  const staffs = ref([])
  const currentStaff = ref(null) // Dùng khi xem chi tiết hoặc edit
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * Lấy danh sách nhân viên
   * @param {Object} params - { storeId: 1, search: 'Huy' }
   */
  async function fetchStaffs(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await staffService.getAll(params)
      staffs.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách nhân viên'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết một nhân viên
   */
  async function fetchStaffDetail(id) {
    loading.value = true
    error.value = null
    try {
      const response = await staffService.getById(id)
      currentStaff.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải chi tiết nhân viên'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo nhân viên mới
   */
  async function createStaffAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await staffService.create(createDto)
      // Tạo xong reload lại danh sách (giữ nguyên filter storeId nếu có)
      await fetchStaffs({ storeId: createDto.storeId })
      return true
    } catch (err) {
      // Backend sẽ trả lỗi "User này đã có hồ sơ nhân viên rồi" nếu trùng
      error.value = err.response?.data?.message || err.response?.data || 'Tạo nhân viên thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật nhân viên
   */
  async function updateStaffAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await staffService.update(id, updateDto)
      // Cập nhật xong load lại list
      await fetchStaffs(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa nhân viên
   */
  async function deleteStaffAction(id, currentFilters = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ nhân viên này?')) return

    loading.value = true
    error.value = null
    try {
      await staffService.delete(id)
      await fetchStaffs(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    staffs,
    currentStaff,
    loading,
    error,
    fetchStaffs,
    fetchStaffDetail,
    createStaffAction,
    updateStaffAction,
    deleteStaffAction
  }
})
