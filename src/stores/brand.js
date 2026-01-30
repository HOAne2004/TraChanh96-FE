import { defineStore } from 'pinia'
import { ref } from 'vue'
import brandService from '@/services/brand.service'

export const useBrandStore = defineStore('brand', () => {
  // --- STATE ---
  const brand = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const storeProducts = ref([])

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

  /**
   * [ADMIN] Lấy danh sách sản phẩm tại cửa hàng
   */
  async function fetchStoreProducts(storeId) {
    loading.value = true
    error.value = null
    try {
      const res = await brandService.getStoreProducts(storeId)
      storeProducts.value = res.data
    } catch (err) {
      console.error('Lỗi tải sản phẩm cửa hàng:', err)
      error.value = 'Không thể tải danh sách sản phẩm'
    } finally {
      loading.value = false
    }
  }
  /**
   * [ADMIN] Bật bán sản phẩm tại store
   */
  async function enableProductAtStore(storeId, productId) {
    try {
      await brandService.enableProduct(storeId, productId)

      // cập nhật local state cho UI mượt
      const item = storeProducts.value.find((p) => p.productId === productId)
      if (item) item.status = 'Available'
    } catch (err) {
      console.error('Enable product failed:', err)
      throw err
    }
  }

  /**
   * [ADMIN] Tắt bán sản phẩm tại store
   */
  async function disableProductAtStore(storeId, productId) {
    try {
      await brandService.disableProduct(storeId, productId)

      const item = storeProducts.value.find((p) => p.productId === productId)
      if (item) item.status = 'Disabled'
    } catch (err) {
      console.error('Disable product failed:', err)
      throw err
    }
  }

  return {
    brand,
    storeProducts,
    loading,
    error,

    fetchPublicBrandInfo,
    createBrand,
    updateBrand,

    // admin – store
    fetchStoreProducts,
    enableProductAtStore,
    disableProductAtStore,
  }
})
