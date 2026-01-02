// src/stores/shopTable.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import shopTableService from '@/services/shopTable.service'

export const useShopTableStore = defineStore('shopTable', () => {
  // --- STATE ---
  const tables = ref([])
  const currentTable = ref(null) // Chi tiết bàn đang chọn (để xem info gộp bàn)
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Nhóm bàn theo Khu vực (Room)
   * Dùng để hiển thị giao diện bán hàng chia theo Tab hoặc Section
   * Return format: { "Tầng 1": [Table1, Table2], "Sân vườn": [Table3] }
   */
  const tablesGroupedByRoom = computed(() => {
    const groups = {}
    tables.value.forEach(table => {
      const roomName = table.room?.name || 'Khác'
      if (!groups[roomName]) {
        groups[roomName] = []
      }
      groups[roomName].push(table)
    })
    return groups
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách bàn của cửa hàng
   * @param {number} storeId - ID cửa hàng bắt buộc
   * @param {Object} params - { roomId: 1 } (Optional)
   */
  async function fetchTables(storeId, params = {}) {
    if (!storeId) return // Bắt buộc phải có storeId

    loading.value = true
    error.value = null
    try {
      const response = await shopTableService.getByStore(storeId, params)
      tables.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách bàn'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết một bàn
   */
  async function fetchTableDetail(id) {
    loading.value = true
    error.value = null
    try {
      const response = await shopTableService.getById(id)
      currentTable.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải chi tiết bàn'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo bàn mới
   */
  async function createTableAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await shopTableService.create(createDto)
      // Tạo xong reload lại danh sách của Store đó
      await fetchTables(createDto.storeId)
      return true
    } catch (err) {
      // Backend check trùng tên sẽ throw lỗi ở đây
      error.value = err.response?.data?.message || 'Tạo bàn thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật bàn (bao gồm cả gộp bàn)
   */
  async function updateTableAction(id, updateDto, currentStoreId) {
    loading.value = true
    error.value = null
    try {
      await shopTableService.update(id, updateDto)
      if (currentStoreId) {
        await fetchTables(currentStoreId)
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa bàn
   */
  async function deleteTableAction(id, currentStoreId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bàn này?')) return

    loading.value = true
    error.value = null
    try {
      await shopTableService.delete(id)
      if (currentStoreId) {
        await fetchTables(currentStoreId)
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tables,
    currentTable,
    tablesGroupedByRoom,
    loading,
    error,
    fetchTables,
    fetchTableDetail,
    createTableAction,
    updateTableAction,
    deleteTableAction
  }
})
