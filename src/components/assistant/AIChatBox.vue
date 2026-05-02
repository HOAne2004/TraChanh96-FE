<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/assistant/chat.store'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

import AIChatbox from '@/assets/images/others/ai-chatbox.png'

const chatStore = useChatStore()
const inputText = ref('')
const chatBodyRef = ref(null)

const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const windowWidth = ref(1024)

let startX = 0
let startY = 0
let initialX = 0
let initialY = 0
let dragMoved = false

const onMouseDown = (e) => {
  if (e.type === 'mousedown' && e.button !== 0) return;

  isDragging.value = true
  dragMoved = false
  startX = e.clientX || e.touches?.[0].clientX
  startY = e.clientY || e.touches?.[0].clientY
  initialX = position.value.x
  initialY = position.value.y

  document.addEventListener('mousemove', onMouseMove, { passive: false })
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchmove', onMouseMove, { passive: false })
  document.addEventListener('touchend', onMouseUp)
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.clientX || e.touches?.[0].clientX
  const currentY = e.clientY || e.touches?.[0].clientY

  const dx = currentX - startX
  const dy = currentY - startY

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    dragMoved = true
  }

  if (dragMoved) {
    position.value = {
      x: initialX + dx,
      y: initialY + dy
    }
    if (e.cancelable) {
      e.preventDefault()
    }
  }
}

const onMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const buttonSize = 60
  const margin = 20

  let finalX = position.value.x
  let finalY = position.value.y

  if (finalX + buttonSize / 2 < screenWidth / 2) {
    finalX = margin
  } else {
    finalX = screenWidth - buttonSize - margin
  }

  if (finalY < margin) {
    finalY = margin
  } else if (finalY > screenHeight - buttonSize - margin) {
    finalY = screenHeight - buttonSize - margin
  }

  position.value = { x: finalX, y: finalY }

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onMouseMove)
  document.removeEventListener('touchend', onMouseUp)
}

const toggleChat = (e) => {
  if (dragMoved) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  chatStore.toggleChat()
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const buttonSize = 60
  const margin = 20

  let x = position.value.x
  let y = position.value.y

  if (x > screenWidth / 2) {
    x = screenWidth - buttonSize - margin
  } else {
    x = margin
  }

  if (y > screenHeight - buttonSize - margin) {
    y = screenHeight - buttonSize - margin
  }

  position.value = { x, y }
}

onMounted(() => {
  windowWidth.value = window.innerWidth
  position.value = {
    x: window.innerWidth - 60 - 20,
    y: window.innerHeight - 60 - 20
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

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

// Cấu hình marked để parse markdown
const renderMarkdown = (text) => {
  if (!text) return ''
  const parsedHtml = marked.parse(text, { breaks: true })
  return DOMPurify.sanitize(parsedHtml)
}
</script>

<template>
  <div
    class="fixed z-[9999]"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    :class="{ 'transition-all duration-300 ease-out': !isDragging }"
  >
    <!-- Nút bong bóng chat nổi ở góc màn hình -->
    <button
      :class="[
        'w-[60px] h-[60px] rounded-full bg-green-500 text-white border-none text-2xl shadow-md transition-colors flex items-center justify-center relative select-none touch-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab hover:bg-green-600',
        !chatStore.isOpen && !chatStore.isTyping ? 'pulse-animation' : '',
        !chatStore.isOpen && chatStore.isTyping ? 'animate-bounce' : ''
      ]"
      @mousedown="onMouseDown"
      @touchstart="onMouseDown"
      @click="toggleChat"
    >
      <img :src="AIChatbox" alt="Trợ lý ảo" class="w-full h-full object-cover rounded-full pointer-events-none">
    </button>

    <!-- Khung Chat -->
    <div
      v-if="chatStore.isOpen"
      :class="[
        'absolute w-[350px] h-[450px] bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden border dark:border-gray-700',
        position.x < windowWidth / 2 ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right',
        position.y < 480 ? 'top-full mt-4 origin-top' : 'bottom-full mb-4 origin-bottom'
      ]"
    >
      <!-- Header -->
      <div class="bg-green-500 text-white p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <img :src="AIChatbox" alt="Trợ lý ảo" class="w-10 h-10 rounded-full">
          <h4 class="font-semibold m-0">Trợ lý AI</h4>
        </div>
        <button @click="chatStore.toggleChat" class="bg-transparent border-none text-white cursor-pointer text-base hover:opacity-80">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Khung hiển thị tin nhắn -->
      <div class="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2.5 bg-gray-50 dark:bg-gray-800" ref="chatBodyRef">
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          :class="[
            'p-2.5 px-3.5 rounded-2xl max-w-[80%] leading-relaxed break-words',
            msg.role === 'user'
              ? 'self-end bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-br-md'
              : 'self-start bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-bl-md text-gray-800 dark:text-gray-100'
          ]"
        >
          <!-- User Message -->
          <div v-if="msg.role === 'user'">{{ msg.content }}</div>

          <!-- AI Message (Markdown) -->
          <div
            v-else
            class="markdown-body"
            v-html="renderMarkdown(msg.content)"
          ></div>
        </div>

        <!-- Hiệu ứng typing -->
        <div v-if="chatStore.isTyping" class="p-2.5 px-4 rounded-2xl max-w-[80%] self-start bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-bl-md flex items-center h-[42px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full bounce-dot" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full bounce-dot" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full bounce-dot" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>

      <!-- Input nhập liệu -->
      <div class="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          v-model="inputText"
          @keyup.enter="handleSend"
          placeholder="Bạn muốn order gì?"
          :disabled="chatStore.isTyping"
          class="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
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

<style scoped>
/* Custom Animations */
@keyframes pulse-wave {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.pulse-animation {
  animation: pulse-wave 2s infinite;
}

@keyframes bounce-dot {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.bounce-dot {
  animation: bounce-dot 0.6s infinite alternate;
}

/* CSS Tùy chỉnh cho nội dung Markdown của AI */
.markdown-body :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(strong), .markdown-body :deep(b) {
  font-weight: 600;
  color: #111827;
}
:global(.dark) .markdown-body :deep(strong), :global(.dark) .markdown-body :deep(b) {
  color: #f3f4f6;
}
.markdown-body :deep(em), .markdown-body :deep(i) {
  font-style: italic;
}
.markdown-body :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-body :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}
.markdown-body :deep(a) {
  color: #10b981;
  text-decoration: underline;
}
.markdown-body :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
  color: #ef4444;
}
:global(.dark) .markdown-body :deep(code) {
  background-color: #374151;
  color: #f87171;
}
.markdown-body :deep(pre) {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}
.markdown-body :deep(pre code) {
  background-color: transparent;
  color: inherit;
  padding: 0;
}
.markdown-body :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 0.75rem;
  color: #4b5563;
  font-style: italic;
  margin-bottom: 0.5rem;
}
:global(.dark) .markdown-body :deep(blockquote) {
  border-left-color: #4b5563;
  color: #9ca3af;
}
/* Tuỳ chỉnh thanh cuộn cho khu vực chat */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>

