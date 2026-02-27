// src/services/address.service.js
import api from './axiosClient'
const ENDPOINT = '/users/addresses'
export default {
  // --- USER ADDRESSES ---
  getAll() {
    return api.get(`${ENDPOINT}`).data
  },
  getByUserId(userId) {
    return api.get(`${ENDPOINT}/user/${userId}`)
  },
  getById(id) {
    return api.get(`/users/addresses/${id}`).data
  },

  create(data) {
    return api.post('/users/addresses', data).data
  },

  update(id, data) {
    return api.put(`/users/addresses/${id}`, data).data
  },

  delete(id) {
    return api.delete(`/users/addresses/${id}`).data
  },

  setDefault(id) {
    return api.patch(`/users/addresses/${id}/set-default`).data
  },

  // --- STORE ADDRESSES ---

  createForStore(data) {
    // 👇 PHẢI DÙNG AWAIT
    return api.post('/stores/addresses', data).data
  },

  updateForStore(id, data) {
    return api.put(`/stores/addresses/${id}`, data).data
  },

  deleteForStore(id, storeId) {
    return api.delete(`/stores/addresses/${id}`, {
      data: { storeId: storeId },
    }).data
  },
}
