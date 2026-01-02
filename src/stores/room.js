// src/stores/room.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import roomService from '@/services/room.service'

export const useRoomStore = defineStore('room', () => {
  // --- STATE ---
  const rooms = ref([])       // Danh sách Public (Active only) - Dùng cho POS/Booking
  const adminRooms = ref([])  // Danh sách Admin (Full) - Dùng cho trang Quản lý
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * [Public] Lấy danh sách phòng theo Store (Chỉ Active)
   * @param {Object} params - { storeId: 1 }
   */
  async function fetchRooms(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await roomService.getAll(params)
      rooms.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách phòng'
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Lấy danh sách phòng quản trị (Tất cả trạng thái)
   * @param {Object} params - { storeId: 1 }
   */
  async function fetchAdminRooms(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await roomService.getAllAdmin(params)
      adminRooms.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải dữ liệu quản trị'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo phòng mới
   */
  async function createRoomAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await roomService.create(createDto)
      // Tạo xong reload list Admin của Store đó
      await fetchAdminRooms({ storeId: createDto.storeId })
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo phòng thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật phòng
   */
  async function updateRoomAction(id, updateDto, currentStoreId = null) {
    loading.value = true
    error.value = null
    try {
      await roomService.update(id, updateDto)
      // Nếu có truyền storeId thì reload lại list để cập nhật UI
      if (currentStoreId) {
        await fetchAdminRooms({ storeId: currentStoreId })
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
   * Xóa phòng
   */
  async function deleteRoomAction(id, currentStoreId = null) {
    if (!confirm('Bạn có chắc chắn muốn xóa khu vực này? Các bàn bên trong cũng sẽ bị ảnh hưởng.')) return

    loading.value = true
    error.value = null
    try {
      await roomService.delete(id)
      if (currentStoreId) {
        await fetchAdminRooms({ storeId: currentStoreId })
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
    rooms,
    adminRooms,
    loading,
    error,
    fetchRooms,
    fetchAdminRooms,
    createRoomAction,
    updateRoomAction,
    deleteRoomAction
  }
})
