// src/services/order.service.js
import api from './axiosClient'

const ENDPOINT = '/orders'

export default {
  // --- 1. TẠO ĐƠN ---

  /**
   * Tạo đơn giao hàng (Delivery)
   * Payload: DeliveryOrderCreateDto { storeId, items, deliveryAddressId, paymentMethodId, ... }
   */
  createDelivery(data) {
    return api.post(`${ENDPOINT}/delivery`, data)
  },

  /**
   * Tạo đơn tại quầy (At Counter)
   * Payload: AtCounterOrderCreateDto { storeId, items, tableId, ... }
   */
  createAtCounter(data) {
    return api.post(`${ENDPOINT}/at-counter`, data)
  },

  // --- 2. TRA CỨU (GET) ---

  /**
   * [CUSTOMER] Lấy danh sách đơn của tôi (Có phân trang)
   * Params: { pageIndex: 1, pageSize: 10 }
   */
  getMyOrders(params = {}) {
    return api.get(`${ENDPOINT}/me`, { params })
  },

  /**
   * [STAFF/ADMIN] Lấy danh sách đơn toàn hệ thống (Có lọc & phân trang)
   * Params: { storeId, status, fromDate, toDate, pageIndex, pageSize }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết đơn hàng
   * Mapping: [HttpGet("{code}")]
   */
  getByCode(code) {
    return api.get(`${ENDPOINT}/${code}`)
  },

  // Thêm hàm gọi API tính phí
  calculateShippingFee(storeId, addressId) {
    return api.get(`${ENDPOINT}/shipping-fee`, {
      params: { storeId, addressId },
    })
  },

  /**
   * [ADMIN/MANAGER] Lấy thống kê nhanh (Doanh thu ngày, đơn chờ xử lý...)
   * Params: { storeId, date }
   */
  getStats(params = {}) {
    return api.get(`${ENDPOINT}/stats`, { params })
  },

  /**
   * Hủy đơn hàng
   * Payload: { reason: string, note: string }
   */
  cancelOrder(id, data) {
    return api.put(`${ENDPOINT}/${id}/cancel`, data)
  },

  // --- 3. XỬ LÝ TRẠNG THÁI (PUT) ---

  /**
   * Cập nhật trạng thái đơn (Duyệt, Nấu xong, Đang giao...)
   * Payload: { status: number } (Enum)
   */
  updateStatus(id, status) {
    return api.put(`${ENDPOINT}/${id}/status`, { status })
  },

  /**
   * Gán Shipper cho đơn hàng
   * Payload: { shipperId: number } (Nếu null thì là tự nhận)
   */
  assignShipper(id, shipperId = null) {
    return api.put(`${ENDPOINT}/${id}/assign-shipper`, { shipperId })
  },

  /**
   * Xác thực mã lấy đồ (Cho đơn tại quầy/mang về)
   * Payload: { pickupCode: string }
   */
  verifyPickup(id, code) {
    return api.put(`${ENDPOINT}/${id}/verify-pickup`, { pickupCode: code })
  },

  /**
   * Xóa mềm đơn hàng (Vào thùng rác)
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Khôi phục đơn hàng từ thùng rác
   */
  restore(id) {
    return api.patch(`${ENDPOINT}/${id}/restore`)
  }
}
