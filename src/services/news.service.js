import api from './axiosClient'

const ENDPOINT = '/news'

export default {
  /**
   * PUBLIC
   */

  // Carousel trang chủ
  getCarousel() {
    return api.get('/carousel')
  },

  // Danh sách bài đã publish
  getPublished() {
    return api.get(ENDPOINT)
  },

  // Chi tiết bài theo slug
  getBySlug(slug) {
    return api.get(`${ENDPOINT}/${slug}`)
  },

  /**
   * ADMIN
   */

  // Lấy toàn bộ bài viết (admin)
  getAllAdmin(params = {}) {
    // params: { search, status }
    return api.get(`${ENDPOINT}/admin`, { params })
  },

  // Tạo bài viết
  create(data) {
    return api.post(ENDPOINT, data)
  },

  // Cập nhật bài viết
  update(id, data) {
    return api.put(`${ENDPOINT}/${id}`, data)
  },

  // Xóa bài viết
  delete(id) {
    return api.delete(`${ENDPOINT}/${id}`)
  },
}
