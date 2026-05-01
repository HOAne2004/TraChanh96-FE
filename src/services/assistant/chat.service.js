import api from '@/services/api/axiosClient'

export const chatService = {
  /**
   * Gửi tin nhắn cho AI
   * @param {Object} payload - { storeId, sessionId, message }
   */
  sendMessage: (payload) => {
    // Truyền silent: true để Axios không tự động bật Toast đỏ nếu API lỗi 500
    // Ta sẽ tự in lỗi thân thiện vào khung chat
    return api.post('/api/v1/Chat/send', payload, { silent: true })
  }
}
