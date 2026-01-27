import { defineStore } from 'pinia'
import { ref } from 'vue'
import brandService from '@/services/brand.service'

export const useBrandStore = defineStore('brand', () => {
  // --- STATE ---
  const brand = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * [PUBLIC] Lấy thông tin brand hiển thị
   */
  async function fetchPublicBrandInfo() {
    loading.value = true
    error.value = null
    try {
      const res = await brandService.getPublicInfo()
      brand.value = res.data
    } catch (err) {
      console.error('Lỗi tải thông tin brand:', err)
      error.value = 'Không thể tải thông tin thương hiệu'
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo brand mới
   */
  async function createBrand(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await brandService.create(payload)
      brand.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo thương hiệu thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Cập nhật brand
   */
  async function updateBrand(id, payload) {
    loading.value = true
    error.value = null
    try {
      const res = await brandService.update(id, payload)
      brand.value = res.data
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thương hiệu thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    brand,
    loading,
    error,
    fetchPublicBrandInfo,
    createBrand,
    updateBrand,
  }
})
