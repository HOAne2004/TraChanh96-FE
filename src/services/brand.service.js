import api from './axiosClient'

const ENDPOINT = '/brand'

export default {
  /**
   * [PUBLIC] Lấy thông tin Brand chính (Footer, AppConfig)
   * GET /api/brand/info
   */
  getPublicInfo() {
    return api.get(`${ENDPOINT}/info`, {
      silent: true, // Không cần toast lỗi mặc định
    })
  },

  /**
   * [ADMIN] Tạo Brand mới
   * POST /api/brand
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * [ADMIN] Cập nhật Brand
   * PUT /api/brand/{id}
   */
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  // ============================
  // ====== ADMIN – STORE =======
  // ============================

  /**
   * [ADMIN] Lấy danh sách sản phẩm + trạng thái tại store
   * GET /api/brand/stores/{storeId}/products
   */
  getStoreProducts(storeId) {
    return api.get(`${ENDPOINT}/stores/${storeId}/products`)
  },

  /**
   * [ADMIN] Bật bán sản phẩm tại store
   * PUT /api/brand/{storeId}/products/{productId}/enable
   */
  enableProduct(storeId, productId) {
    return api.put(`${ENDPOINT}/${storeId}/products/${productId}/enable`)
  },

  /**
   * [ADMIN] Tắt bán sản phẩm tại store
   * PUT /api/brand/{storeId}/products/{productId}/disable
   */
  disableProduct(storeId, productId) {
    return api.put(`${ENDPOINT}/${storeId}/products/${productId}/disable`)
  },
}
