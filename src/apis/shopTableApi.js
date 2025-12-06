import api from './index'

const SHOP_TABLE_ENDPOINT = 'api/shoptable'

const handleError = (error, actionName) => {
  console.error(`❌ Lỗi khi ${actionName}:`, error.message)
  throw error
}

const shopTableApi = {
  /**
   * Lấy danh sách bàn theo ID cửa hàng (GET /ShopTable/store/:storeId)
   * @param {number} storeId
   */
  async fetchTablesByStore(storeId) {
    try {
      const { data } = await api.get(`${SHOP_TABLE_ENDPOINT}/store/${storeId}`)
      return data
    } catch (err) {
      handleError(err, `lấy danh sách bàn của store ID ${storeId}`)
    }
  },

  /**
   * Lấy chi tiết bàn (GET /ShopTable/:id)
   * @param {number} id
   */
  async fetchTableById(id) {
    try {
      const { data } = await api.get(`${SHOP_TABLE_ENDPOINT}/${id}`)
      return data
    } catch (err) {
      handleError(err, `lấy thông tin bàn ID ${id}`)
    }
  },

  /**
   * Tạo bàn mới (POST /ShopTable)
   * @param {object} tableData - { storeId, name, capacity, canBeMerged }
   */
  async createTable(tableData) {
    try {
      const { data } = await api.post(SHOP_TABLE_ENDPOINT, tableData)
      return data
    } catch (err) {
      handleError(err, 'tạo bàn mới')
    }
  },

  /**
   * Cập nhật bàn (PUT /ShopTable/:id)
   * @param {number} id
   * @param {object} tableData
   */
  async updateTable(id, tableData) {
    try {
      // Backend trả về message text hoặc object, nhưng thường ta chỉ cần status 200
      const { data } = await api.put(`${SHOP_TABLE_ENDPOINT}/${id}`, tableData)
      return data
    } catch (err) {
      handleError(err, `cập nhật bàn ID ${id}`)
    }
  },

  /**
   * Xóa bàn (DELETE /ShopTable/:id)
   * @param {number} id
   */
  async deleteTable(id) {
    try {
      await api.delete(`${SHOP_TABLE_ENDPOINT}/${id}`)
      return true
    } catch (err) {
      handleError(err, `xóa bàn ID ${id}`)
    }
  }
}

export default shopTableApi
