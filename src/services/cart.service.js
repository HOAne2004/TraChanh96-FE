// src/services/cart.service.js
import api from './axiosClient'

const ENDPOINT = '/Cart'

export default {
  /**
   * Lấy giỏ hàng cá nhân
   * Mapping: [HttpGet("me")]
   */
  getMyCart() {
    return api.get(`${ENDPOINT}/me`)
  },

  /**
   * Thêm sản phẩm vào giỏ
   * Mapping: [HttpPost("add-item")]
   * Payload: CartItemCreateDto { productId, quantity, sizeId, sugarLevelId, iceLevelId, note, toppings }
   */
  addToCart(data) {
    return api.post(`${ENDPOINT}/add-item`, data)
  },

  /**
   * Cập nhật số lượng item
   * Mapping: [HttpPut("update-item")]
   * Payload: CartItemUpdateDto { cartItemId, quantity }
   */
  updateItemQuantity(data) {
    return api.put(`${ENDPOINT}/update-item`, data)
  },

  /**
   * Xóa 1 item khỏi giỏ
   * Mapping: [HttpDelete("remove-item/{cartItemId}")]
   */
  removeItem(cartItemId) {
    return api.delete(`${ENDPOINT}/remove-item/${cartItemId}`)
  },

  /**
   * Xóa sạch giỏ hàng
   * Mapping: [HttpDelete("clear")]
   */
  clearCart() {
    return api.delete(`${ENDPOINT}/clear`)
  },

  /**
   * Xóa sạch giỏ hàng theo store
   * Mapping: [HttpDelete("clear/{storeId}")]
   */
  clearCartByStore(storeId) {
    return api.delete(`/Cart/clear/${storeId}`)
  },
}
