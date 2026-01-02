import api from './axiosClient'

const ENDPOINT = '/socialmedias'

export default {
  /**
   * [PUBLIC] Lấy social media đang active
   * Dùng cho Footer / Header
   */
  getActive(params = {}) {
    return api.get(`${ENDPOINT}/active`, { params })
  },

  /**
   * [ADMIN/MANAGER] Lấy danh sách
   */
  getAll(params = {}) {
    return api.get(`${ENDPOINT}/admin`, { params })
  },

  /**
   * [ADMIN/MANAGER] Chi tiết
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [ADMIN] Tạo mới
   */
  create(payload) {
    return api.post(ENDPOINT, payload)
  },

  /**
   * [ADMIN] Cập nhật
   */
  update(id, payload) {
    return api.put(`${ENDPOINT}/${id}`, payload)
  },

  /**
   * [ADMIN] Xóa
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },
}
