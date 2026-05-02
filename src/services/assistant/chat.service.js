import api from '@/services/api/axiosClient'

export const chatService = {
  /**
   * Gửi tin nhắn cho AI
   * @param {Object} payload - { storeId, sessionId, message }
   */
  sendMessage: (payload) => {
    return api.post('chat/send', payload, { silent: true })
  }
}
