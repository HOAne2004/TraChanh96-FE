// src/services/inventory.service.js
import api from './axiosClient'

const ENDPOINT = '/inventory'

export default {
  /**
   * Lấy danh sách tồn kho
   * Mapping: [HttpGet] /api/inventory?storeId=...&search=...
   * Params: { storeId: number | null, search: string }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết tồn kho theo ID
   * Mapping: [HttpGet("{id}")] /api/inventory/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Khởi tạo tồn kho đầu kỳ
   * Mapping: [HttpPost] /api/inventory
   * Payload: InventoryCreateDto { materialId, storeId, quantity, ... }
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Cập nhật số lượng / Kiểm kho
   * Mapping: [HttpPut("{id}")] /api/inventory/{id}
   * Payload: InventoryUpdateDto { quantity, note }
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Xóa bản ghi tồn kho
   * Mapping: [HttpDelete("{id}")] /api/inventory/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
