// src/stores/size.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import sizeService from '@/services/size.service'
import { useToastStore } from '@/stores/toast'
export const useSizeStore = defineStore('size', () => {
  // --- STATE ---
  const sizes = ref([]) // List size (Admin hoặc Client tùy ngữ cảnh)
  const currentSize = ref(null) // Size đang xem/sửa
  const loading = ref(false)
  const error = ref(null)
  const toast = useToastStore()
  // --- ACTIONS ---

  /**
   * [PUBLIC] Lấy danh sách active
   */
  async function fetchActiveSizes() {
    loading.value = true
    try {
      const res = await sizeService.getAll()
      sizes.value = res.data
    } catch (err) {
      toast.show({ type: 'error', message: 'Lỗi tải danh sách size!' })
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Lấy danh sách quản trị
   */
  async function fetchAdminSizes() {
    loading.value = true
    try {
      const res = await sizeService.getAllAdmin()
      sizes.value = res.data
    } catch (err) {
      console.error('Lỗi tải danh sách size:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo Size
   */
  async function createSize(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await sizeService.create(payload)
      sizes.value.push(res.data)
      return true
    } catch (err) {
      toast.show({ type: 'error', message: 'Lỗi tạo size!' })
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Cập nhật Size
   */
  async function updateSize(id, payload) {
    loading.value = true
    error.value = null
    try {
      const res = await sizeService.update(id, payload)
      // Cập nhật local
      const index = sizes.value.findIndex((s) => s.id === id)
      if (index !== -1) sizes.value[index] = res.data
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi cập nhật'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Xóa Size (Có check usage)
   */
  async function deleteSize(id) {
    // 1. Check usage trước xem có an toàn để xóa không
    try {
      const usageRes = await sizeService.getUsage(id)
      const count = usageRes.data.count //

      if (count > 0) {
        alert(`Không thể xóa: Size này đang được dùng bởi ${count} sản phẩm.`)
        return false
      }
    } catch (err) {
      toast.show({ type: 'error', message: 'Lỗi khi xóa size!' })
    }

    if (!confirm('Bạn có chắc chắn muốn xóa Size này?')) return false

    loading.value = true
    try {
      await sizeService.delete(id)
      sizes.value = sizes.value.filter((s) => s.id !== id)
      return true
    } catch (err) {
      toast.show({ type: 'error', message: 'Lỗi khi xóa size!' })
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    sizes,
    currentSize,
    loading,
    error,
    fetchActiveSizes,
    fetchAdminSizes,
    createSize,
    updateSize,
    deleteSize,
  }
})
