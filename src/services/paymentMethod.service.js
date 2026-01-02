import api from './axiosClient'

const ENDPOINT = '/paymentmethods'

export default {
    /**
     * [PUBLIC] Lấy danh sách đang hoạt động (cho trang Checkout)
     */
    getActive() {
        return api.get(`${ENDPOINT}/active`)
    },

    /**
     * [ADMIN] Lấy tất cả (để quản lý)
     */
    getAll() {
        return api.get(ENDPOINT)
    },

    /**
     * [ADMIN] Xem chi tiết
     */
    getById(id) {
        return api.get(`${ENDPOINT}/${id}`)
    },

    /**
     * [ADMIN] Tạo mới
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * [ADMIN] Cập nhật
     */
    update(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data)
    },

    /**
     * [ADMIN] Bật/Tắt trạng thái
     */
    toggleStatus(id) {
        return api.patch(`${ENDPOINT}/${id}/status`)
    },

    /**
     * [ADMIN] Xóa mềm
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    }
}
