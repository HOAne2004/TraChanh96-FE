<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/assistant/chat.store'

const chatStore = useChatStore()
const inputText = ref('')
const chatBodyRef = ref(null)

const handleSend = () => {
  if (!inputText.value.trim()) return

  // Giả sử storeId lấy từ global store, hoặc fix cứng là 1 để test trước
  const currentStoreId = 1;

  chatStore.sendMessage(currentStoreId, inputText.value)
  inputText.value = ''
}

// Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
watch(() => chatStore.messages.length, async () => {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
})
</script>

<template>
  <div class="fixed bottom-5 right-5 z-[9999]">
    <!-- Nút bong bóng chat nổi ở góc màn hình -->
    <button
      class="w-[60px] h-[60px] rounded-full bg-green-500 text-white border-none text-2xl cursor-pointer shadow-md hover:bg-green-600 transition-colors"
      @click="chatStore.toggleChat"
    >
      <img src="@/assets/images/others/ai-chatbox.png" alt="Trợ lý ảo" class="w-full h-full object-cover rounded-full">
    </button>

    <!-- Khung Chat -->
    <div v-if="chatStore.isOpen" class="absolute bottom-[70px] right-0 w-[350px] h-[450px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-green-500 text-white p-3 flex justify-between items-center">
        <h4 class="font-semibold m-0">Trợ lý AI</h4>
        <button @click="chatStore.toggleChat" class="bg-transparent border-none text-white cursor-pointer text-base hover:opacity-80">
          ✖
        </button>
      </div>

      <!-- Khung hiển thị tin nhắn -->
      <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 bg-gray-50" ref="chatBodyRef">
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          :class="[
            'p-2.5 px-3.5 rounded-2xl max-w-[80%] leading-relaxed break-words',
            msg.role === 'user'
              ? 'self-end bg-blue-50 text-blue-900 rounded-br-md'
              : 'self-start bg-white border border-gray-100 rounded-bl-md'
          ]"
        >
          {{ msg.content }}
        </div>

        <!-- Hiệu ứng typing -->
        <div v-if="chatStore.isTyping" class="p-2.5 px-3.5 rounded-2xl max-w-[80%] leading-relaxed break-words self-start bg-white border border-gray-100 rounded-bl-md text-gray-500 italic">
          AI đang gõ...
        </div>
      </div>

      <!-- Input nhập liệu -->
      <div class="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          v-model="inputText"
          @keyup.enter="handleSend"
          placeholder="Bạn muốn order gì?"
          :disabled="chatStore.isTyping"
          class="flex-1 py-2 px-3 border border-gray-300 rounded-full outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          @click="handleSend"
          :disabled="chatStore.isTyping || !inputText.trim()"
          class="py-2 px-4 bg-green-500 text-white border-none rounded-full cursor-pointer hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Gửi
        </button>
      </div>
    </div>
  </div>
</template>


