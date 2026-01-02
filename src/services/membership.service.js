// src/services/membership.service.js
import api from './axiosClient'

const ENDPOINT = '/memberships'

export default {
  /**
   * [USER] Lấy thông tin thành viên của tôi (Hạng, điểm...)
   * Mapping: [HttpGet("me")] /api/memberships/me
   * Trả về: MembershipReadDto
   */
  getMyMembership() {
    return api.get(`${ENDPOINT}/me`)
  }
}
