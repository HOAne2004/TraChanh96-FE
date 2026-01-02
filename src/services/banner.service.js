// src/services/banner.service.js
import api from './axiosClient'

const ENDPOINT = '/Banners'

export default {
    /**
     * Lấy danh sách Banner
     * Mapping: [HttpGet] ?position=...
     * @param {String} position - Vị trí banner (VD: 'Home-Top', 'Sidebar'...)
     */
    getAll(position = null) {
        // Nếu có position thì truyền vào params, không thì lấy hết
        const params = position ? { position } : {}
        return api.get(ENDPOINT, { params })
    },

    /**
     * [ADMIN] Tạo banner mới
     * Mapping: [HttpPost]
     * Payload: BannerCreateDto
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * [ADMIN] Xóa banner
     * Mapping: [HttpDelete("{id}")]
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    }
}