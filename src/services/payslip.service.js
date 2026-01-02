// src/services/payslip.service.js
import api from './axiosClient'

const ENDPOINT = '/payslips'

export default {
  /**
   * Tính toán và tạo phiếu lương (Generate)
   * Mapping: [HttpPost("calculate")] /api/payslips/calculate
   * Payload: PayslipCreateDto { staffId, month, year, ... }
   */
  generate(data) {
    return api.post(`${ENDPOINT}/calculate`, data)
  },

  /**
   * Lấy danh sách phiếu lương
   * Mapping: [HttpGet] /api/payslips?storeId=...&month=...&year=...
   * Params: { storeId, month, year }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết phiếu lương
   * Mapping: [HttpGet("{id}")] /api/payslips/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Cập nhật phiếu lương (Thưởng, Phạt, Ghi chú, Trạng thái)
   * Mapping: [HttpPut("{id}")] /api/payslips/{id}
   * Payload: PayslipUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Xóa phiếu lương (Chỉ xóa được khi ở trạng thái Draft)
   * Mapping: [HttpDelete("{id}")] /api/payslips/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
