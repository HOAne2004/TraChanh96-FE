// src/services/userVoucher.service.js
import api from './axiosClient'

const ENDPOINT = '/uservouchers'

export default {
  /**
   * [USER] Lấy danh sách Voucher của tôi
   * Chỉ lấy voucher: Chưa dùng, Chưa hết hạn, Template đang Active
   * Mapping: [HttpGet("me")] /api/uservouchers/me
   */
  getMyVouchers() {
    return api.get(`${ENDPOINT}/me`)
  },

  /**
   * [USER] Kiểm tra và Áp dụng Voucher vào đơn hàng
   * Dùng ở bước Checkout để tính số tiền được giảm
   * Mapping: [HttpPost("apply")] /api/uservouchers/apply
   * Payload: { voucherCode: string, orderTotalAmount: number }
   * Response: VoucherApplyResultDto { isValid, discountAmount, finalAmount, ... }
   */
  applyVoucher(data) {
    return api.post(`${ENDPOINT}/apply`, data)
  },

  /**
   * [ADMIN] Phát hành Voucher thủ công cho User
   * Mapping: [HttpPost("issue")] /api/uservouchers/issue
   * Payload: UserVoucherCreateDto
   */
  issueVoucher(data) {
    return api.post(`${ENDPOINT}/issue`, data)
  }
}
