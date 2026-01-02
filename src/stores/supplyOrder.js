// src/stores/supplyOrder.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplyOrderService from '@/services/supplyOrder.service'

// Giả định Enum trạng thái (Cần khớp với Backend SupplyOrderStatusEnum)
export const SupplyOrderStatus = {
  Pending: 0,   // Chờ duyệt
  Approved: 1,  // Đã duyệt (Chờ hàng về)
  Received: 2,  // Đã nhập kho (Hoàn thành)
  Cancelled: 3  // Đã hủy
}

export const useSupplyOrderStore = defineStore('supplyOrder', () => {
  // --- STATE ---
  const orders = ref([])
  const currentOrder = ref(null) // Chi tiết phiếu đang xem
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * Lấy danh sách phiếu nhập
   * @param {Object} params - { storeId, status, from, to }
   */
  async function fetchOrders(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await supplyOrderService.getAll(params)
      orders.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách phiếu nhập'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết phiếu
   */
  async function fetchOrderDetail(id) {
    loading.value = true
    error.value = null
    try {
      const response = await supplyOrderService.getById(id)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải chi tiết phiếu'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo phiếu yêu cầu nhập hàng
   */
  async function createOrderAction(createDto) {
    loading.value = true
    error.value = null
    try {
      const response = await supplyOrderService.create(createDto)
      // Tạo xong load lại danh sách
      await fetchOrders({ storeId: createDto.storeId })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo phiếu nhập thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật thông tin hoặc trạng thái chung
   */
  async function updateOrderAction(id, updateDto, currentFilters = {}) {
    loading.value = true
    error.value = null
    try {
      await supplyOrderService.update(id, updateDto)
      // Nếu đang xem chi tiết thì cập nhật luôn currentOrder
      if (currentOrder.value && currentOrder.value.id === id) {
        await fetchOrderDetail(id)
      }
      await fetchOrders(currentFilters)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Helper Actions cho chuyển trạng thái ---

  /**
   * Duyệt phiếu (Pending -> Approved)
   */
  async function approveOrder(id) {
    if (!confirm('Duyệt phiếu nhập này?')) return
    return await updateOrderAction(id, { status: SupplyOrderStatus.Approved })
  }

  /**
   * Xác nhận đã nhận hàng (Approved -> Received)
   * Hành động này sẽ TĂNG TỒN KHO
   */
  async function confirmReceived(id) {
    if (!confirm('Xác nhận đã nhận đủ hàng? Kho sẽ được cập nhật ngay lập tức.')) return
    return await updateOrderAction(id, {
      status: SupplyOrderStatus.Received,
      receivedAt: new Date().toISOString()
    })
  }

  /**
   * Hủy phiếu
   */
  async function cancelOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn hủy phiếu này?')) return
    return await updateOrderAction(id, { status: SupplyOrderStatus.Cancelled })
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderDetail,
    createOrderAction,
    updateOrderAction,
    approveOrder,
    confirmReceived,
    cancelOrder
  }
})
