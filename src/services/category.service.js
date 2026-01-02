// src/services/category.service.js
import api from './axiosClient'
const ENDPOINT = '/categories'
export default {
  /**
   * Lấy tất cả danh mục
   * Mapping: [HttpGet] /api/categories
   * Trả về: Array<CategoryReadDto>
   */
  getAll() {
    return api.get(ENDPOINT)
  },

  /**
   * Lấy chi tiết danh mục theo ID
   * Mapping: [HttpGet("{id}")] /api/categories/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * [Admin/Manager] Tạo danh mục mới
   * Mapping: [HttpPost] /api/categories
   * Payload: CategoryCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [Admin/Manager] Cập nhật danh mục
   * Mapping: [HttpPut("{id}")] /api/categories/{id}
   * Payload: CategoryUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * [Admin/Manager] Xóa danh mục
   * Mapping: [HttpDelete("{id}")] /api/categories/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },
}
