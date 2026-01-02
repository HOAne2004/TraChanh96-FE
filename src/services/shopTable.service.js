// src/services/shopTable.service.js
import api from './axiosClient'

const ENDPOINT = '/shoptable' // Controller tên là ShopTableController (số ít)

export default {
  /**
   * Lấy danh sách bàn theo Cửa hàng (và lọc theo Khu vực nếu cần)
   * Mapping: [HttpGet("store/{storeId}")] /api/shoptable/store/{storeId}?roomId=...
   * Params: { roomId: number | null }
   */
  getByStore(storeId, params = {}) {
    return api.get(`${ENDPOINT}/store/${storeId}`, { params })
  },

  /**
   * Lấy chi tiết bàn (kèm thông tin gộp bàn)
   * Mapping: [HttpGet("{id}")] /api/shoptable/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [Admin/Manager] Tạo bàn mới
   * Mapping: [HttpPost] /api/shoptable
   * Payload: ShopTableCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [Admin/Manager] Cập nhật bàn (Đổi tên, Chuyển khu vực, Gộp bàn)
   * Mapping: [HttpPut("{id}")] /api/shoptable/{id}
   * Payload: ShopTableUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [Admin/Manager] Xóa bàn (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/shoptable/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
