// src/services/product.service.js
import api from './axiosClient'

const ENDPOINT = '/products'

export default {
    /**
     * Lấy danh sách sản phẩm (Public)
     * Mapping: [HttpGet] ?search=...&categorySlug=...&sort=...
     * @param {Object} params { search, categorySlug, sort }
     */
    getAll(params = {}) {
        return api.get(ENDPOINT, { params })
    },

    /**
     * Lấy chi tiết theo ID (Thường dùng cho Admin hoặc khi đã có ID)
     * Mapping: [HttpGet("{id}")]
     */
    getById(id) {
        return api.get(`${ENDPOINT}/${id}`)
    },

    /**
     * Lấy chi tiết theo Slug (Dùng cho trang chi tiết sản phẩm phía Khách)
     * Mapping: [HttpGet("slug/{slug}")]
     */
    getBySlug(slug) {
        return api.get(`${ENDPOINT}/slug/${slug}`)
    },

    /**
     * [ADMIN] Tạo sản phẩm mới
     * Mapping: [HttpPost]
     * Payload: ProductCreateDto { name, categoryId, basePrice, sizeIds: [], ... }
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * [ADMIN] Cập nhật sản phẩm
     * Mapping: [HttpPut("{id}")]
     * Payload: ProductUpdateDto
     */
    update(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data)
    },

    /**
     * [ADMIN] Xóa sản phẩm
     * Mapping: [HttpDelete("{id}")]
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    }
}