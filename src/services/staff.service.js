// src/services/staff.service.js
import api from './axiosClient'

const ENDPOINT = '/staffs'

export default {
  /**
   * Lấy danh sách nhân viên
   * Mapping: [HttpGet] /api/staffs?storeId=...&search=...
   * Params: { storeId: number | null, search: string }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết hồ sơ nhân viên
   * Mapping: [HttpGet("{id}")] /api/staffs/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo hồ sơ nhân viên mới
   * Lưu ý: Cần chọn UserId chưa có hồ sơ nhân viên
   * Mapping: [HttpPost] /api/staffs
   * Payload: StaffCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Cập nhật thông tin nhân viên (Chức vụ, lương, cửa hàng...)
   * Mapping: [HttpPut("{id}")] /api/staffs/{id}
   * Payload: StaffUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Xóa nhân viên
   * Mapping: [HttpDelete("{id}")] /api/staffs/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
