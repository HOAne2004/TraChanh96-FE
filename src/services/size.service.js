// src/services/size.service.js
import api from './axiosClient'

const ENDPOINT = '/sizes'

export default {
    /**
     * [PUBLIC] Lấy danh sách Size đang active (Dùng cho khách hàng/bộ lọc)
     * Mapping: [HttpGet]
     */
    getAll() {
        return api.get(ENDPOINT)
    },

    /**
     * [ADMIN] Lấy tất cả Size (Active + Inactive)
     * Mapping: [HttpGet("admin")]
     */
    getAllAdmin() {
        return api.get(`${ENDPOINT}/admin`)
    },

    /**
     * Lấy chi tiết Size
     * Mapping: [HttpGet("{id}")]
     */
    getById(id) {
        return api.get(`${ENDPOINT}/${id}`)
    },

    /**
     * [ADMIN] Kiểm tra xem Size này đang được dùng bởi bao nhiêu sản phẩm
     * Mapping: [HttpGet("{id}/usage")]
     */
    getUsage(id) {
        return api.get(`${ENDPOINT}/${id}/usage`)
    },

    /**
     * [ADMIN] Tạo Size mới
     * Mapping: [HttpPost]
     * Payload: SizeCreateDto
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * [ADMIN] Cập nhật Size
     * Mapping: [HttpPut("{id}")]
     * Payload: SizeUpdateDto
     */
    update(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data)
    },

    /**
     * [ADMIN] Xóa Size
     * Mapping: [HttpDelete("{id}")]
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    }
}