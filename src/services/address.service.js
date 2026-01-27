// src/services/address.service.js
import api from './axiosClient'

export default {
  // --- USER ADDRESSES ---
  async getAll() {
    return (await api.get('/users/addresses')).data
  },

  async getById(id) {
    return (await api.get(`/users/addresses/${id}`)).data
  },

  async create(data) {
    return (await api.post('/users/addresses', data)).data
  },

  async update(id, data) {
    return (await api.put(`/users/addresses/${id}`, data)).data
  },

  async delete(id) {
    return (await api.delete(`/users/addresses/${id}`)).data
  },

  async setDefault(id) {
    return (await api.patch(`/users/addresses/${id}/set-default`)).data
  },

  // --- STORE ADDRESSES ---

  async createForStore(data) {
    // 👇 PHẢI DÙNG AWAIT
    return (await api.post('/stores/addresses', data)).data
  },

  async updateForStore(id, data) {
    return (await api.put(`/stores/addresses/${id}`, data)).data
  },

  async deleteForStore(id, storeId) {
    return (await api.delete(`/stores/addresses/${id}`, {
      data: { storeId: storeId },
    })).data
  },
}
