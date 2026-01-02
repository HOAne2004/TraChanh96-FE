// src/services/store.service.js
import api from './axiosClient'

const ENDPOINT = '/stores'

export default {
    /**
     * [PUBLIC] Lấy danh sách cửa hàng đang hoạt động
     * Mapping: [HttpGet]
     */
    getActiveStores() {
        return api.get(ENDPOINT)
    },

    /**
     * [PUBLIC] Lấy chi tiết cửa hàng theo Slug
     * Mapping: [HttpGet("{slug}")]
     */
    getBySlug(slug) {
        return api.get(`${ENDPOINT}/${slug}`)
    },

    // --- ADMIN ---

    /**
     * [ADMIN] Lấy danh sách tất cả (có lọc)
     * Mapping: [HttpGet("admin")] ?search=...&status=...
     */
    getAllAdmin(params = {}) {
        return api.get(`${ENDPOINT}/admin`, { params })
    },

    /**
     * [ADMIN] Tạo cửa hàng mới
     * Mapping: [HttpPost]
     * Payload: StoreCreateDto (Lưu ý: Cần AddressId)
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * [ADMIN] Cập nhật cửa hàng
     * Mapping: [HttpPut("{id}")]
     */
    update(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data)
    },

    /**
     * [ADMIN] Xóa cửa hàng
     * Mapping: [HttpDelete("{id}")]
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    }
}