import api from './axiosClient'

const ENDPOINT = '/comments'

export default {
  /**
   * Lấy danh sách bình luận theo bài viết
   * GET /api/comments/news/{newsId}
   */
  getByNewsId(newsId) {
    return api.get(`${ENDPOINT}/news/${newsId}`)
  },

  /**
   * Gửi bình luận mới hoặc trả lời
   * POST /api/comments
   * Payload: { newsId, content, parentId }
   */
  create(data) {
    return api.post(ENDPOINT, data)
  },

  /**
   * Xóa bình luận
   * DELETE /api/comments/{id}
   */
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },

  /**
   * Thả tim / Bỏ tim (Toggle)
   * POST /api/comments/{id}/like
   */
  toggleLike(id) {
    return api.post(`${ENDPOINT}/${id}/like`)
  }
}
