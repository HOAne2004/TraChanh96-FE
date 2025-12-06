import api from './index'

const STORES_ENDPOINT = 'api/stores'

const handleError = (error, name) => {
  console.error(`❌ Lỗi khi fetch ${name}:`, error.message)
  throw error
}

const storeApi = {
  // READ
  async fetchStores() {
    try {
      const { data } = await api.get(STORES_ENDPOINT)
      return data
    } catch (err) {
      handleError(err, 'stores')
    }
  },
  // --- ADMIN CRUD ACTIONS (BỔ SUNG) ---

  /**
   * TẠO: Thêm chi nhánh mới (POST /stores)
   * @param {object} storeData - Dữ liệu chi nhánh mới
   */
  async createStore(storeData) {
    try {
      const { data } = await api.post(STORES_ENDPOINT, storeData)
      return data
    } catch (err) {
      handleError(err, 'tạo chi nhánh mới')
    }
  },

  /**
   * CẬP NHẬT: Chỉnh sửa chi nhánh (PUT /stores/:id)
   * @param {string} id - ID chi nhánh
   * @param {object} storeData - Dữ liệu cần cập nhật
   */
  async updateStore(id, storeData) {
    try {
      const { data } = await api.put(`${STORES_ENDPOINT}/${id}`, storeData)
      return data
    } catch (err) {
      handleError(err, `cập nhật chi nhánh ID ${id}`)
    }
  },

  /**
   * XÓA: Xóa chi nhánh (DELETE /stores/:id)
   * @param {string} id - ID chi nhánh
   */
  async deleteStore(id) {
    try {
      await api.delete(`${STORES_ENDPOINT}/${id}`)
      return true
    } catch (err) {
      handleError(err, `xóa chi nhánh ID ${id}`)
    }
  },
}

export default storeApi
