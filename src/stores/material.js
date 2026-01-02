// src/stores/material.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import materialService from '@/services/material.service'

export const useMaterialStore = defineStore('material', () => {
  // --- STATE ---
  const materials = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Getter: Lọc lấy danh sách các nguyên liệu đang hoạt động (IsActive == true)
   * Dùng cho các thẻ <select> ở module khác (như Inventory, Recipe)
   */
  const activeMaterials = computed(() => {
    return materials.value.filter((m) => m.isActive === true)
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách nguyên liệu
   * @param {Object} params - { search: '', isActive: true/false }
   */
  async function fetchMaterials(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await materialService.getAll(params)
      materials.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách nguyên liệu'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo nguyên liệu mới
   */
  async function createMaterialAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await materialService.create(createDto)
      // Tạo xong load lại danh sách để cập nhật
      await fetchMaterials()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo nguyên liệu thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật nguyên liệu
   */
  async function updateMaterialAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await materialService.update(id, updateDto)
      // Load lại danh sách theo filter hiện tại (để tránh mất trạng thái tìm kiếm)
      await fetchMaterials(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa nguyên liệu (Backend sẽ Soft Delete -> IsActive = false)
   */
  async function deleteMaterialAction(id, currentFilters = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa (ngưng hoạt động) nguyên liệu này?')) return

    loading.value = true
    error.value = null
    try {
      await materialService.delete(id)
      // Load lại danh sách để cập nhật trạng thái hiển thị
      await fetchMaterials(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    materials,
    activeMaterials,
    loading,
    error,
    fetchMaterials,
    createMaterialAction,
    updateMaterialAction,
    deleteMaterialAction
  }
})
