import api from './axiosClient'

const ENDPOINT = '/franchise'

export default {
  /**
   * [PUBLIC] Gửi yêu cầu nhượng quyền
   * POST /api/franchise
   */
  create(payload) {
    return api.post(ENDPOINT, payload)
  },

  /**
   * [ADMIN/MANAGER] Lấy danh sách yêu cầu
   * GET /api/franchise?status=&search=
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * [ADMIN/MANAGER] Lấy chi tiết theo ID
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [ADMIN/MANAGER] Cập nhật yêu cầu
   */
  update(id, payload) {
    return api.put(`${ENDPOINT}/${id}`, payload)
  },

  /**
   * [ADMIN] Xóa yêu cầu
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },
}
