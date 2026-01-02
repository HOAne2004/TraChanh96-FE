import api from './axiosClient'

const ENDPOINT = '/Reviews'

export default {
  /**
   * Lấy danh sách đánh giá công khai của sản phẩm
   * @param {Number} productId
   */
  getReviewsByProduct(productId) {
    return api.get(`${ENDPOINT}/product/${productId}`)
  },

  /**
   * Kiểm tra xem user có được quyền đánh giá món này không
   * (Để hiện/ẩn nút "Viết đánh giá")
   * @param {Number} productId
   */
  checkEligibility(productId) {
    return api.get(`${ENDPOINT}/can-review/${productId}`)
  },

  /**
   * Gửi đánh giá mới
   * Payload: { orderId, productId, rating, content, mediaUrl }
   */
  createReview(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Sửa đánh giá (User sửa của mình)
   * Payload: { rating, content, mediaUrl }
   */
  updateReview(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  /**
   * Xóa đánh giá
   */
  deleteReview(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  }
}
