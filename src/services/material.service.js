// src/services/material.service.js
import api from './axiosClient'

const ENDPOINT = '/materials'

export default {
  /**
   * Lấy danh sách nguyên liệu
   * Mapping: [HttpGet] /api/materials?search=...&isActive=...
   * Params: { search: string, isActive: boolean | null }
   */
  getAll(params = {}) {
    return api.get(ENDPOINT, { params })
  },

  /**
   * Lấy chi tiết nguyên liệu theo ID
   * Mapping: [HttpGet("{id}")] /api/materials/{id}
   */
  getById(id) {
    return api.get(`${ENDPOINT}/${id}`)
  },

  /**
   * Tạo nguyên liệu mới
   * Mapping: [HttpPost] /api/materials
   * Payload: MaterialCreateDto
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Cập nhật thông tin nguyên liệu
   * Mapping: [HttpPut("{id}")] /api/materials/{id}
   * Payload: MaterialUpdateDto
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Xóa nguyên liệu (Soft Delete)
   * Mapping: [HttpDelete("{id}")] /api/materials/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
