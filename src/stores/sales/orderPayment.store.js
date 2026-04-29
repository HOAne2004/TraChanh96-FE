// src/stores/orderPayment.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderPaymentService from '@/services/sales/orderPayment.service'

export const useOrderPaymentStore = defineStore('orderPayment', () => {
  // --- STATE ---
  const payments = ref([]) // Lịch sử thanh toán của đơn hàng hiện tại
  const currentPayment = ref(null) // Giao dịch vừa tạo (charge)
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  /**
   * Tạo yêu cầu thanh toán (Charge)
   * @param {number} orderId - ID đơn hàng
   * @param {number} paymentMethodId - ID phương thức thanh toán
   * @returns {Promise<Object>} Kết quả trả về (OrderPaymentReadDto)
   */
  async function createCharge(orderId, paymentMethodId) {
    loading.value = true
    error.value = null
    try {
      const response = await orderPaymentService.createCharge({
        orderId,
        paymentMethodId,
      })
      currentPayment.value = response.data
      // Thêm vào đầu danh sách payments nếu đang xem đơn đó
      if (payments.value.length && payments.value[0]?.orderId === orderId) {
        payments.value.unshift(response.data)
      }
      return response.data
    } catch (err) {
      console.error('Create charge error:', err)
      error.value = err.response?.data?.message || 'Tạo giao dịch thanh toán thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy lịch sử thanh toán của một đơn hàng
   * @param {number} orderId
   */
  async function fetchPaymentHistory(orderId) {
    loading.value = true
    error.value = null
    try {
      const response = await orderPaymentService.getHistoryByOrder(orderId)
      payments.value = response.data
    } catch (err) {
      console.error('Fetch payment history error:', err)
      error.value = err.response?.data?.message || 'Lỗi tải lịch sử thanh toán'
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset state (khi rời khỏi trang chi tiết đơn)
   */
  function clearPaymentState() {
    payments.value = []
    currentPayment.value = null
    error.value = null
  }

  return {
    payments,
    currentPayment,
    loading,
    error,
    createCharge,
    fetchPaymentHistory,
    clearPaymentState,
  }
})
