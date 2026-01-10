// src/services/admin.service.js
import api from './axiosClient'

const ENDPOINT = '/admin'
export default {
  /**
   * Lấy danh sách tất cả người dùng
   * Mapping: [HttpGet("users")]
   * Trả về: Array<UserReadDto>
   */
  getAllUsers() {
    return api.get(`${ENDPOINT}/users`)
  },

  /**
   * Cập nhật thông tin/role/status người dùng
   * Mapping: [HttpPatch("users/{publicId}")]
   * Payload: UserUpdateDto
   */
  updateUser(publicId, data) {
    return api.patch(`${ENDPOINT}/users/${publicId}`, data)
  },

  /**
   * Xóa người dùng
   * Mapping: [HttpDelete("users/{publicId}")]
   */
  deleteUser(publicId) {
    return api.delete(`${ENDPOINT}/users/${publicId}`)
  },
}
