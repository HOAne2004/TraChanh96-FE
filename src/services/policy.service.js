// src/services/policy.service.js
import api from './axiosClient'

const ENDPOINT = '/policies'

export default {
  /**
   * [PUBLIC] Lấy danh sách chính sách đang Active
   * Dùng để hiển thị Menu chính sách ở Footer
   * Mapping: [HttpGet("active")] /api/policies/active?brandId=...&storeId=...
   * Params: { brandId: number, storeId: number | null }
   */
  getActive(params = {}) {
    return api.get(`${ENDPOINT}/active`, { params })
  },

  /**
   * [PUBLIC] Lấy nội dung chính sách theo Slug
   * Dùng cho trang chi tiết: /pages/chinh-sach-doi-tra
   * Mapping: [HttpGet("{slug}")] /api/policies/{slug}
   */
  getBySlug(slug) {
    return api.get(`${ENDPOINT}/${slug}`)
  },

  /**
   * [ADMIN] Lấy danh sách quản trị (có lọc theo Status)
   * Mapping: [HttpGet("admin")] /api/policies/admin
   * Params: { brandId, storeId, status }
   */
  getAllAdmin(params = {}) {
    return api.get(`${ENDPOINT}/admin`, { params })
  },

  /**
   * [ADMIN] Tạo chính sách mới
   * Mapping: [HttpPost] /api/policies
   * Payload: PolicyCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [ADMIN] Cập nhật chính sách
   * Mapping: [HttpPut("{id}")] /api/policies/{id}
   * Payload: PolicyUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [ADMIN] Xóa chính sách (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/policies/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
