// src/stores/voucherTemplate.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import voucherTemplateService from '@/services/voucherTemplate.service'

export const useVoucherTemplateStore = defineStore('voucherTemplate', () => {
  // --- STATE ---
  const templates = ref([])
  const currentTemplate = ref(null) // Dùng để xem chi tiết hoặc Edit
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * Lấy danh sách Template
   * @param {Object} params - { search: 'Sale', status: 1 }
   */
  async function fetchTemplates(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherTemplateService.getAll(params)
      templates.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách khuyến mãi'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết
   */
  async function fetchTemplateDetail(id) {
    loading.value = true
    error.value = null
    try {
      const response = await voucherTemplateService.getById(id)
      currentTemplate.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải chi tiết'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo mới Template
   */
  async function createTemplateAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await voucherTemplateService.create(createDto)
      await fetchTemplates() // Load lại danh sách sau khi tạo
      return true
    } catch (err) {
      // Bắt lỗi logic từ BE: Ngày tháng không hợp lệ, Trùng mã...
      error.value = err.response?.data?.message || 'Tạo khuyến mãi thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật Template
   */
  async function updateTemplateAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await voucherTemplateService.update(id, updateDto)
      await fetchTemplates(currentFilters) // Load lại giữ nguyên bộ lọc
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa Template
   */
  async function deleteTemplateAction(id, currentFilters = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa chương trình này?')) return

    loading.value = true
    error.value = null
    try {
      await voucherTemplateService.delete(id)
      await fetchTemplates(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    templates,
    currentTemplate,
    loading,
    error,
    fetchTemplates,
    fetchTemplateDetail,
    createTemplateAction,
    updateTemplateAction,
    deleteTemplateAction
  }
})
