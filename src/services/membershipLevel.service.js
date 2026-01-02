// src/services/membershipLevel.service.js
import api from './axiosClient'

const ENDPOINT = '/membershipLevels'

export default {
  /**
   * Lấy danh sách tất cả cấp độ thành viên (Public)
   * Mapping: [HttpGet] /api/membershipLevels
   * Trả về: Array<MembershipLevelReadDto> (Đã sort theo MinCoinsRequired)
   */
  getAll() {
    return api.get(ENDPOINT)
  },

  /**
   * [Admin] Lấy chi tiết cấp độ
   * Mapping: [HttpGet("{id}")] /api/membershipLevels/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [Admin] Tạo cấp độ mới
   * Mapping: [HttpPost] /api/membershipLevels
   * Payload: MembershipLevelCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [Admin] Cập nhật cấp độ
   * Mapping: [HttpPut("{id}")] /api/membershipLevels/{id}
   * Payload: MembershipLevelUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [Admin] Xóa cấp độ (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/membershipLevels/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
