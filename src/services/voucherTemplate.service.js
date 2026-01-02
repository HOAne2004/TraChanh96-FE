// src/services/voucherTemplate.service.js
import api from './axiosClient'

const ENDPOINT = '/vouchertemplates'

export default {
  /**
   * Lấy danh sách mẫu khuyến mãi (có lọc)
   * Mapping: [HttpGet] /api/vouchertemplates?search=...&status=...
   * Params: { search: string, status: number } (Status: 1=Active, 0=Inactive...)
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết mẫu voucher
   * Mapping: [HttpGet("{id}")] /api/vouchertemplates/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [Admin] Tạo chương trình khuyến mãi mới
   * Mapping: [HttpPost] /api/vouchertemplates
   * Payload: VoucherTemplateCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [Admin] Cập nhật
   * Mapping: [HttpPut("{id}")] /api/vouchertemplates/{id}
   * Payload: VoucherTemplateUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [Admin] Xóa (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/vouchertemplates/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
