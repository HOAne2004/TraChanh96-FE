import api from './axiosClient'

const ENDPOINT = '/brand'

export default {
  /**
   * [PUBLIC] Lấy thông tin Brand chính (Footer, AppConfig)
   * GET /api/brand/info
   */
  getPublicInfo() {
    return api.get(`${ENDPOINT}/info`, {
      silent: true, // Không cần toast lỗi mặc định
    })
  },

  /**
   * [ADMIN] Tạo Brand mới
   * POST /api/brand
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [ADMIN] Cập nhật Brand
   * PUT /api/brand/{id}
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },
}
