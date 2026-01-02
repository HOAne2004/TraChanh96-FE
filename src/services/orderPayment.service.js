import api from './axiosClient'

const ENDPOINT = '/order-payment' // Hoặc endpoint tương ứng trong Controller Payment

export default {
  /**
   * Tạo yêu cầu thanh toán (Charge)
   * Payload: { orderId, paymentMethodId, amount }
   */
  createCharge(data) {
    return api.post(`${ENDPOINT}/charge`, data)
  },

  /**
   * Lấy lịch sử thanh toán của đơn hàng
   */
  getHistoryByOrder(orderId) {
    return api.get(`${ENDPOINT}/history/${orderId}`)
  }
}
