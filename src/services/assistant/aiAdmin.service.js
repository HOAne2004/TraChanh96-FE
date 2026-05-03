import api from '@/services/api/axiosClient'

export const aiAdminService = {
  /**
   * Gọi API để AI sinh nội dung Markdown
   * @param {Object} data - { prompt: string, contentType: "product" | "blog" }
   */
  generateMarkdown: (data, config = {}) => {
    return api.post('chat/admin/generate-content', data, config)
  }
}
