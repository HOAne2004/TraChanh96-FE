// src/services/supplyOrder.service.js
import api from './axiosClient'

const ENDPOINT = '/supplyorders'

export default {
  /**
   * Lấy danh sách phiếu nhập
   * Mapping: [HttpGet] /api/supplyorders?storeId=...&status=...&from=...&to=...
   * Params: { storeId, status, from, to }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết phiếu nhập (kèm danh sách vật tư chi tiết)
   * Mapping: [HttpGet("{id}")] /api/supplyorders/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo phiếu nhập mới (Status mặc định là Pending)
   * Mapping: [HttpPost] /api/supplyorders
   * Payload: SupplyOrderCreateDto { storeId, note, items: [...] }
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Cập nhật phiếu nhập (Duyệt, Nhập kho, Hủy, Sửa ghi chú)
   * Lưu ý: Khi chuyển status sang Received, kho sẽ tự động tăng.
   * Mapping: [HttpPut("{id}")] /api/supplyorders/{id}
   * Payload: SupplyOrderUpdateDto { status, note, receivedAt, ... }
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  }
}
