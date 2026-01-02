// src/stores/membershipLevel.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import membershipLevelService from '@/services/membershipLevel.service'

export const useMembershipLevelStore = defineStore('membershipLevel', () => {
  // --- STATE ---
  const levels = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Helper: Tìm cấp độ tương ứng với số điểm hiện tại
   * (Dùng để tính toán hiển thị thanh tiến trình hoặc dự báo hạng)
   */
  const getLevelByPoint = (point) => {
    // Vì danh sách đã được BE sort theo MinCoinsRequired tăng dần
    // Ta tìm cấp độ cao nhất mà point >= minCoinsRequired
    // Dùng cú pháp [...levels.value] để copy mảng rồi reverse để tìm từ cao xuống thấp
    const sortedDesc = [...levels.value].sort((a, b) => b.minCoinsRequired - a.minCoinsRequired)
    return sortedDesc.find(l => point >= l.minCoinsRequired) || null
  }

  // --- ACTIONS ---

  /**
   * Lấy danh sách cấp độ
   */
  async function fetchLevels() {
    loading.value = true
    error.value = null
    try {
      const response = await membershipLevelService.getAll()
      levels.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách cấp độ'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo cấp độ mới
   */
  async function createLevelAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await membershipLevelService.create(createDto)
      await fetchLevels() // Load lại danh sách
      return true
    } catch (err) {
      // Backend check trùng tên sẽ throw exception ở đây
      error.value = err.response?.data?.message || 'Tạo cấp độ thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật cấp độ
   */
  async function updateLevelAction(id, updateDto) {
    loading.value = true
    error.value = null
    try {
      await membershipLevelService.update(id, updateDto)
      await fetchLevels()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa cấp độ
   */
  async function deleteLevelAction(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa cấp độ này?')) return

    loading.value = true
    error.value = null
    try {
      await membershipLevelService.delete(id)
      await fetchLevels()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    levels,
    loading,
    error,
    fetchLevels,
    createLevelAction,
    updateLevelAction,
    deleteLevelAction,
    getLevelByPoint // Expose helper này để dùng trong Component
  }
})
