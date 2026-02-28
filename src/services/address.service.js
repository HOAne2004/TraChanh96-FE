// src/services/address.service.js
import api from './axiosClient'
const ENDPOINT = '/users/addresses'

export default {
  // --- USER ADDRESSES ---
  async getAll() {
    const res = await api.get(ENDPOINT)
    return res.data
  },

  async getByUserId(userId) {
    const res = await api.get(`${ENDPOINT}/user/${userId}`)
    return res.data
  },

  async getById(id) {
    const res = await api.get(`${ENDPOINT}/${id}`)
    return res.data
  },

  async create(data) {
    const res = await api.post(ENDPOINT, data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`${ENDPOINT}/${id}`, data)
    return res.data
  },

  async delete(id) {
    const res = await api.delete(`${ENDPOINT}/${id}`)
    return res.data
  },

  async setDefault(id) {
    const res = await api.patch(`${ENDPOINT}/${id}/set-default`)
    return res.data
  },

  // --- STORE ADDRESSES ---
  async createForStore(data) {
    const res = await api.post('/stores/addresses', data)
    return res.data
  },

  async updateForStore(id, data) {
    const res = await api.put(`/stores/addresses/${id}`, data)
    return res.data
  },

  async deleteForStore(id, storeId) {
    const res = await api.delete(`/stores/addresses/${id}`, {
      data: { storeId },
    })
    return res.data
  },
}
