// src/services/address.service.js
import api from './axiosClient'

const ENDPOINT = '/users/addresses'

export default {
    /**
     * Lấy danh sách địa chỉ của User hiện tại
     * Mapping: [HttpGet]
     */
    getAll() {
        return api.get(ENDPOINT)
    },

    /**
     * Lấy chi tiết 1 địa chỉ
     * Mapping: [HttpGet("{id}")]
     */
    getById(id) {
        return api.get(`${ENDPOINT}/${id}`)
    },

    /**
     * Tạo địa chỉ mới
     * Mapping: [HttpPost]
     * Payload: AddressCreateDto
     */
    create(data) {
        return api.post(ENDPOINT, data)
    },

    /**
     * Cập nhật địa chỉ
     * Mapping: [HttpPut("{id}")]
     * Payload: AddressUpdateDto
     */
    update(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data)
    },

    /**
     * Xóa địa chỉ
     * Mapping: [HttpDelete("{id}")]
     */
    delete(id) {
        return api.delete(`${ENDPOINT}/${id}`)
    },

    /**
     * Đặt làm địa chỉ mặc định
     * Mapping: [HttpPatch("{id}/set-default")]
     */
    setDefault(id) {
        return api.patch(`${ENDPOINT}/${id}/set-default`)
    }
}