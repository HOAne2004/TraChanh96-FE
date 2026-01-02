// src/services/notification.service.js
import api from './axiosClient'

const ENDPOINT = '/notifications'

export default {
  /**
   * [USER] Lấy danh sách thông báo của tôi (Cá nhân + Hệ thống)
   * Mapping: [HttpGet] /api/notifications
   * Trả về: Array<NotificationReadDto>
   */
  getMyNotifications() {
    return api.get(ENDPOINT)
  },

  /**
   * [ADMIN] Tạo/Gửi thông báo mới
   * Mapping: [HttpPost] /api/notifications
   * Payload: NotificationCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [USER] Đánh dấu đã đọc một thông báo
   * Mapping: [HttpPatch("{id}/read")] /api/notifications/{id}/read
   */
  markAsRead(id) {
    return api.patch(`${ENDPOINT}/${id}/read`)
  },

  getAll(params) {
    return api.get(`${ENDPOINT}/manage`, { params })
  },
}
