// src/services/user.service.js
import api from './axiosClient'
const ENDPOINT = '/users'
export default {
  /**
   * Lấy thông tin cá nhân (Profile)
   * Mapping: [HttpGet("me")]
   * Trả về: UserReadDto
   */
  getMe() {
    return api.get(`${ENDPOINT}/me`)
  },

  /**
   * Cập nhật thông tin cá nhân
   * Mapping: [HttpPut("me")]
   * @param {Object} data - Dữ liệu cần sửa (Phone, ThumbnailUrl, v.v.)
   */
  updateMe(data) {
    return api.put(`${ENDPOINT}/me`, data)
  },

  /**
   * Tự xóa tài khoản
   * Mapping: [HttpDelete("me")]
   */
  deleteMe() {
    return api.delete(`${ENDPOINT}/me`)
  },
}
