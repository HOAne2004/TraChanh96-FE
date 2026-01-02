// src/stores/inventory.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import inventoryService from '@/services/inventory.service'

export const useInventoryStore = defineStore('inventory', () => {
  // --- STATE ---
  const inventories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Getter: Lọc ra các sản phẩm sắp hết hàng (Low Stock)
   * Giả định InventoryReadDto trả về có trường isLowStock hoặc quantity < minStock
   */
  const lowStockItems = computed(() => {
    // Tùy thuộc vào DTO trả về, ví dụ nếu BE trả về flag isLowStock:
    // return inventories.value.filter(item => item.isLowStock)

    // Hoặc nếu muốn tự tính ở FE (ví dụ < 10):
    return inventories.value.filter(item => item.quantity < 10)
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách tồn kho
   * @param {Object} params - { storeId: 1, search: 'Cafe' }
   */
  async function fetchInventories(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await inventoryService.getAll(params)
      inventories.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải dữ liệu kho'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo mới (Nhập kho đầu kỳ)
   */
  async function createInventoryAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await inventoryService.create(createDto)
      // Tạo xong load lại danh sách (giữ nguyên filter hiện tại nếu cần thiết, ở đây load mặc định)
      // Nếu bạn muốn giữ storeId đang xem, cần lưu storeId vào state, ở đây tôi gọi mặc định
      await fetchInventories({ storeId: createDto.storeId })
      return true
    } catch (err) {
      // Backend có throw exception "Nguyên liệu này đã tồn tại...", thông báo này sẽ hiện ở đây
      error.value = err.response?.data?.message || 'Khởi tạo tồn kho thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật số lượng (Kiểm kho)
   */
  async function updateInventoryAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await inventoryService.update(id, updateDto)
      await fetchInventories(currentFilters) // Load lại theo bộ lọc hiện tại
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật kho thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa bản ghi kho
   */
  async function deleteInventoryAction(id, currentFilters = {}) {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi tồn kho này?')) return

    loading.value = true
    error.value = null
    try {
      await inventoryService.delete(id)
      await fetchInventories(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    inventories,
    lowStockItems,
    loading,
    error,
    fetchInventories,
    createInventoryAction,
    updateInventoryAction,
    deleteInventoryAction
  }
})
