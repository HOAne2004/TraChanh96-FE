// src/services/room.service.js
import api from './axiosClient'

const ENDPOINT = '/rooms'

export default {
  /**
   * [PUBLIC] Lấy danh sách phòng đang hoạt động (Active)
   * Thường dùng cho màn hình đặt bàn hoặc POS bán hàng
   * Mapping: [HttpGet] /api/rooms?storeId=...
   * Params: { storeId: number }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * [ADMIN] Lấy tất cả phòng (bao gồm ẩn/inactive)
   * Dùng cho trang quản lý sơ đồ phòng
   * Mapping: [HttpGet("admin")] /api/rooms/admin?storeId=...
   * Params: { storeId: number }
   */
  getAllAdmin(params = {}) {
    return api.get(`${ENDPOINT}/admin`, { params })
  },

  /**
   * Lấy chi tiết phòng
   * Mapping: [HttpGet("{id}")] /api/rooms/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [Admin] Tạo phòng mới
   * Mapping: [HttpPost] /api/rooms
   * Payload: RoomCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [Admin] Cập nhật phòng
   * Mapping: [HttpPut("{id}")] /api/rooms/{id}
   * Payload: RoomUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [Admin] Xóa phòng (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/rooms/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
