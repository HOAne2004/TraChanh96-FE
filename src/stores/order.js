// src/stores/order.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderService from '@/services/order.service'

export const useOrderStore = defineStore('order', () => {
  // --- STATE ---
  const orders = ref([]) // Danh sách đơn hàng
  const currentOrder = ref(null) // Chi tiết đơn hàng đang xem
  const stats = ref(null) // Thống kê nhanh (Dashboard)
  const shippingFee = ref(0) // 🟢 Chuyển từ computed sang ref
  const isCalculatingShip = ref(false)

  // State phân trang
  const pagination = ref({
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  })

  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * [Customer] Lấy danh sách đơn của tôi
   */
  async function fetchMyOrders(pageIndex = 1, pageSize = 10) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.getMyOrders({ pageIndex, pageSize })
      const result = response.data // PagedResult<T>

      orders.value = result.items
      pagination.value = {
        pageIndex: result.pageIndex,
        pageSize: result.pageSize,
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
      }
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải lịch sử đơn hàng'
    } finally {
      loading.value = false
    }
  }

  /**
   * [Staff/Admin] Lấy danh sách quản lý (có Filter)
   */
  async function fetchOrders(filters = {}) {
    loading.value = true
    error.value = null
    try {
      // Tách riêng pagination và filter
      const { pageIndex = 1, pageSize = 10, ...filterParams } = filters

      const params = {
        pageIndex,
        pageSize,
        ...filterParams,
      }

      const response = await orderService.getAll(params)
      const result = response.data

      orders.value = result.items
      pagination.value = {
        pageIndex: result.pageIndex,
        pageSize: result.pageSize,
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
      }
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách đơn hàng'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết đơn
   */
  async function fetchOrderDetail(code) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.getByCode(code)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Không tìm thấy đơn hàng'
      // Nếu lỗi 403 (Forbid) -> UI có thể hiện thông báo "Không có quyền xem"
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy thống kê nhanh (Dashboard)
   */
  async function fetchStats(storeId = null) {
    try {
      const response = await orderService.getStats({ storeId })
      stats.value = response.data
    } catch (err) {
      console.error('Lỗi tải thống kê:', err)
    }
  }

  // --- NHÓM TẠO ĐƠN (CHECKOUT) ---

  async function createDeliveryOrderAction(data) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.createDelivery(data)
      // Trả về Order Object (có thể chứa PaymentUrl nếu là Ví điện tử)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Đặt hàng thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAtCounterOrderAction(data) {
    loading.value = true
    error.value = null
    try {
      const response = await orderService.createAtCounter(data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo đơn thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPickupOrderAction(payload) {
    loading.value = true
    try {
      // Gọi endpoint API (Giả sử BE là POST /orders/pickup)
      const res = await orderService.createPickup(payload)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo đơn thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- NHÓM XỬ LÝ ĐƠN ---

  /**
   * Cập nhật trạng thái (Duyệt, Nấu, Giao...)
   */
  async function updateStatusAction(id, newStatus) {
    loading.value = true
    try {
      const response = await orderService.updateStatus(id, newStatus)
      const updatedOrder = response.data

      // Cập nhật state local để UI phản hồi ngay
      if (currentOrder.value && currentOrder.value.id === id) {
        currentOrder.value = updatedOrder
      }

      // Tìm và update trong danh sách (nếu có)
      const index = orders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }

      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật trạng thái thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Gán Shipper
   */
  async function assignShipperAction(id, shipperId) {
    loading.value = true
    try {
      // 1. Gọi API Gán Shipper
      // ⚠️ LƯU Ý: Hãy đảm bảo trong file 'services/order.service.js', hàm assignShipper
      // phải gọi đúng URL: api.put(`/orders/${id}/assign-shipper`, { shipperId })
      await orderService.assignShipper(id, shipperId)

      // 2. 🟢 FIX LỖI RELOAD: Dùng orderCode thay vì id
      if (currentOrder.value && currentOrder.value.orderCode) {
        await fetchOrderDetail(currentOrder.value.orderCode)
      }

      return true
    } catch (err) {
      // Xử lý thông báo lỗi chi tiết hơn
      const msg = err.response?.data?.message || err.response?.data || 'Gán shipper thất bại'
      error.value = msg
      throw new Error(msg) // Ném lỗi ra để View bắt được
    } finally {
      loading.value = false
    }
  }

  /**
   * Hủy đơn
   */
  async function cancelOrderAction(orderId, cancelData) {
    // cancelData = { reason: 1, note: '...' }
    loading.value = true
    try {
      await orderService.cancelOrder(orderId, cancelData)
      // ...
    } catch (err) {
      error.value = err.response?.data?.message || 'Hủy đơn thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Tính phí giao hàng
   */


  // Helper để reset (dùng khi rời trang hoặc xóa giỏ hàng)
  function resetShippingFee() {
    shippingFee.value = 0
  }
  async function deleteOrderAction(id) {
    if (!confirm('Chuyển đơn hàng này vào thùng rác?')) return false

    loading.value = true
    try {
      await orderService.delete(id)
      // Client-side remove: Xóa khỏi danh sách hiện tại để đỡ phải gọi lại API
      orders.value = orders.value.filter((o) => o.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      alert(error.value)
      return false
    } finally {
      loading.value = false
    }
  }
  async function restoreOrderAction(id) {
    loading.value = true
    try {
      await orderService.restore(id)
      // Client-side remove: Đơn đã khôi phục thì biến mất khỏi danh sách thùng rác
      orders.value = orders.value.filter((o) => o.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Khôi phục thất bại'
      alert(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function confirmPaymentAction(id) {
    loading.value = true
    try {
      await orderService.confirmPayment(id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xác nhận thanh toán thất bại'
      alert(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function verifyPickupAction(id, pickupCode) {
    loading.value = true
    try {
      const codeValue =
        typeof pickupCode === 'object' && pickupCode.pickupCode ? pickupCode.pickupCode : pickupCode

      await orderService.verifyPickup(id, codeValue)
      return true
    // eslint-disable-next-line no-useless-catch
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }
  return {
    orders,
    currentOrder,
    stats,
    pagination,
    loading,
    error,
    fetchMyOrders,
    fetchOrders,
    fetchOrderDetail,
    fetchStats,
    createDeliveryOrderAction,
    createAtCounterOrderAction,
    createPickupOrderAction,
    updateStatusAction,
    assignShipperAction,
    cancelOrderAction,
    shippingFee,
    isCalculatingShip,
    resetShippingFee,
    deleteOrderAction,
    restoreOrderAction,
    confirmPaymentAction,
    verifyPickupAction,
  }
})
