import api from './index'

const NEWS_ENDPOINT = 'api/news'

const handleError = (error, name) => {
  console.error(`❌ Lỗi khi fetch ${name}:`, error.message)
  throw error
}

const newsApi = {
  async fetchNews() {
    try {
      const { data } = await api.get(NEWS_ENDPOINT)
      return data
    } catch (err) {
      handleError(err, 'news')
    }
  },

  // --- ADMIN CRUD ACTIONS (BỔ SUNG) ---

  /**
   * TẠO: Thêm tin tức mới (POST /news)
   * @param {object} newsData - Dữ liệu tin tức mới
   */
  async createNews(newsData) {
    try {
      // Thêm trường createdAt giả lập
      const newNews = { ...newsData, createdAt: new Date().toISOString() }
      const { data } = await api.post(NEWS_ENDPOINT, newNews)
      return data
    } catch (err) {
      handleError(err, 'tạo tin tức mới')
    }
  },

  /**
   * CẬP NHẬT: Chỉnh sửa tin tức (PUT /news/:id)
   * @param {string} id - ID tin tức
   * @param {object} newsData - Dữ liệu cần cập nhật
   */
  async updateNews(id, newsData) {
    try {
      // Sử dụng PUT để cập nhật toàn bộ resource
      const { data } = await api.put(`${NEWS_ENDPOINT}/${id}`, newsData)
      return data
    } catch (err) {
      handleError(err, `cập nhật tin tức ID ${id}`)
    }
  },

  /**
   * XÓA: Xóa tin tức (DELETE /news/:id)
   * @param {string} id - ID tin tức
   */
  async deleteNews(id) {
    try {
      await api.delete(`${NEWS_ENDPOINT}/${id}`)
      return true
    } catch (err) {
      handleError(err, `xóa tin tức ID ${id}`)
    }
  },
}

export default newsApi
