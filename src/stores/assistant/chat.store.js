import { defineStore } from 'pinia'
import { chatService } from '@/services/assistant/chat.service'
import { useCartStore } from '@/stores/sales/cart.store'

export const useChatStore = defineStore('chat', {
  state: () => ({
    isOpen: false,
    isTyping: false, // Hiển thị hiệu ứng "AI đang gõ..."
    // Lấy SessionId từ LocalStorage, nếu chưa có thì khởi tạo null
    sessionId: localStorage.getItem('ai_chat_session') || null,
    messages: []
  }),

  actions: {
    initSession() {
      // Dùng crypto API có sẵn của trình duyệt để tạo Guid chuẩn
      if (!this.sessionId) {
        this.sessionId = crypto.randomUUID()
        localStorage.setItem('ai_chat_session', this.sessionId)
      }
    },

    toggleChat() {
      this.isOpen = !this.isOpen

      // Nếu vừa mở lên và chưa có tin nhắn nào -> AI chào tự động
      if (this.isOpen && this.messages.length === 0) {
        this.messages.push({
          role: 'model',
          content: 'Chào bạn! Mình là trợ lý ảo của quán. Bạn muốn dùng món gì hôm nay?'
        })
      }
    },

    async sendMessage(storeId, text) {
      if (!text.trim()) return

      this.initSession()

      // 1. Thêm tin nhắn của User vào UI lập tức
      this.messages.push({ role: 'user', content: text })
      this.isTyping = true

      try {
        // 2. Gọi API
        const response = await chatService.sendMessage({
          storeId: storeId || 1, // Truyền ID cửa hàng hiện tại đang xem
          sessionId: this.sessionId,
          message: text
        })

        const result = response.data

        if (result.success) {
          // 3. AI trả lời thành công
          this.messages.push({ role: 'model', content: result.data.textResponse })

          // 4. 🔥 LOGIC ĂN TIỀN: Cập nhật lại giỏ hàng nếu AI báo đã thêm món
          if (result.data.isCartUpdated) {
            const cartStore = useCartStore()
            if (cartStore.fetchCart) {
              await cartStore.fetchCart() // Gọi hàm reload giỏ hàng của bạn
            }
          }
        }
      } catch (error) {
        console.log('Lỗi: ', error)
        // Fallback thân thiện nếu Backend dở chứng
        this.messages.push({
          role: 'model',
          content: 'Dạ hệ thống em đang bận chút xíu, mình thông cảm đợi em lát rồi nhắn lại nha.'
        })
      } finally {
        this.isTyping = false
      }
    }
  }
})
