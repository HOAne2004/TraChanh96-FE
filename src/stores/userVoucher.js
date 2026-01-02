// src/stores/userVoucher.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userVoucherService from '@/services/userVoucher.service'

export const useUserVoucherStore = defineStore('userVoucher', () => {
  // --- STATE ---
  const vouchers = ref([]) // Danh sách voucher trong ví của user
  const appliedVoucher = ref(null) // Voucher đã áp dụng thành công cho đơn hàng hiện tại

  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Số lượng voucher khả dụng (để hiện badge thông báo)
   */
  const availableCount = computed(() => vouchers.value.length)

  /**
   * Lấy số tiền giảm giá hiện tại (nếu đã apply thành công)
   */
  const currentDiscountAmount = computed(() => {
    return appliedVoucher.value ? appliedVoucher.value.discountAmount : 0
  })

  /**
   * Lấy mã code đang dùng
   */
  const currentVoucherCode = computed(() => {
    return appliedVoucher.value ? appliedVoucher.value.voucherCode : null
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách voucher của tôi
   */
  async function fetchMyVouchers() {
    loading.value = true
    error.value = null
    try {
      const response = await userVoucherService.getMyVouchers()
      vouchers.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải voucher'
    } finally {
      loading.value = false
    }
  }

  /**
   * Áp dụng voucher (Gọi khi user nhập code hoặc chọn từ list ở trang Checkout)
   * @param {string} code - Mã voucher
   * @param {number} orderTotal - Tổng tiền đơn hàng tạm tính
   */
  async function applyVoucherAction(code, orderTotal) {
    loading.value = true
    error.value = null
    // Reset trước khi apply mới
    appliedVoucher.value = null

    try {
      const payload = {
        voucherCode: code,
        orderTotalAmount: orderTotal
      }

      const response = await userVoucherService.applyVoucher(payload)
      const result = response.data

      if (result.isValid) {
        // Lưu lại kết quả apply để hiển thị ở UI (Code, Số tiền giảm)
        appliedVoucher.value = result
        return result // Trả về để component hiển thị thông báo thành công
      } else {
        throw new Error(result.message || 'Voucher không hợp lệ')
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Áp dụng voucher thất bại'
      error.value = msg
      throw err // Ném lỗi để UI bắt được và hiện Toast Error
    } finally {
      loading.value = false
    }
  }

  /**
   * Hủy chọn voucher (Người dùng bấm nút Xóa/Gỡ voucher ở trang Checkout)
   */
  function removeAppliedVoucher() {
    appliedVoucher.value = null
    error.value = null
  }

  /**
   * [Admin] Phát hành voucher
   */
  async function issueVoucherAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await userVoucherService.issueVoucher(createDto)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Phát hành voucher thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    vouchers,
    appliedVoucher,
    availableCount,
    currentDiscountAmount,
    currentVoucherCode,
    loading,
    error,
    fetchMyVouchers,
    applyVoucherAction,
    removeAppliedVoucher,
    issueVoucherAction
  }
})
