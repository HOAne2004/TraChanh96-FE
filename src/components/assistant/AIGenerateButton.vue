<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { aiAdminService } from '@/services/assistant/aiAdmin.service'
import { useToastStore } from '@/stores/system/toast.store'

const props = defineProps({
  contentType: {
    type: String,
    default: 'product', // Có thể truyền 'store', 'blog', 'policy'...
  }
})

// Emit sự kiện 'generated' mang theo kết quả HTML/Markdown để Component cha xử lý
const emit = defineEmits(['generated'])
const toast = useToastStore()

const showInput = ref(false)
const prompt = ref('')
const isLoading = ref(false)
const abortController = ref(null)

const toggleInput = () => {
  if (isLoading.value) return // Không đóng popup khi đang tải
  showInput.value = !showInput.value
  if (!showInput.value) prompt.value = ''
}

const closeInput = () => {
  if (isLoading.value) return
  showInput.value = false
  prompt.value = ''
}

const cancelGenerate = () => {
  if (abortController.value) {
    abortController.value.abort('Người dùng đã hủy tiến trình.')
    abortController.value = null
  }
}

const handleGenerate = async () => {
  if (!prompt.value.trim() || isLoading.value) return

  isLoading.value = true
  abortController.value = new AbortController()

  try {
    const payload = {
      prompt: prompt.value,
      contentType: props.contentType
    }

    const response = await aiAdminService.generateMarkdown(
      payload,
      { signal: abortController.value.signal }
    )

    if (response.data.success) {
      emit('generated', response.data.data)
      toast.show({ type: 'success', message: 'Tạo nội dung AI thành công!' })
      showInput.value = false
      prompt.value = ''
    } else {
      toast.show({ type: 'error', message: response.message || 'Lỗi khi tạo nội dung.' })
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      toast.show({ type: 'info', message: 'Đã hủy tạo nội dung.' })
    } else {
      console.error("Lỗi AI:", error)
      toast.show({ type: 'error', message: 'Không thể kết nối với AI lúc này.' })
    }
  } finally {
    isLoading.value = false
    abortController.value = null
  }
}
</script>

<template>
  <div class="relative inline-block text-left">
    <!-- Nút kích hoạt AI -->
    <button
      type="button"
      @click="toggleInput"
      class="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
      title="Dùng AI để viết nội dung"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clip-rule="evenodd" />
      </svg>
      <span>Trợ lý AI</span>
    </button>

    <!-- Khung nhập Prompt (Chỉ hiện khi bấm vào nút) -->
    <div v-if="showInput" class="absolute top-full right-0 mt-3 w-[320px] bg-white border border-gray-100 rounded-xl z-50 overflow-hidden shadow-2xl origin-top-right transition-all">
      <div class="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600">
        <div class="flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-bold">AI Sinh Nội Dung</span>
        </div>
        <button type="button" @click="closeInput" class="text-white/80 text-xl hover:text-white transition-colors cursor-pointer border-none bg-transparent leading-none" :disabled="isLoading">&times;</button>
      </div>
      
      <div class="p-4 bg-gray-50/50">
        <textarea
          v-model="prompt"
          rows="3"
          placeholder="Nhập yêu cầu cho AI (VD: Mô tả trà chanh dưa lưới, chua ngọt, mát lạnh)..."
          class="w-full p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg outline-none resize-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-inner"
          @keyup.enter.exact.prevent="handleGenerate"
          :disabled="isLoading"
        ></textarea>
        <p class="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          Nhấn Enter để tạo nội dung
        </p>
      </div>

      <div class="px-4 py-3 flex justify-end gap-2 bg-white border-t border-gray-100">
        <button
          v-if="isLoading"
          type="button"
          @click="cancelGenerate"
          class="bg-white text-red-600 border border-red-200 py-1.5 px-3.5 rounded-md text-xs font-semibold cursor-pointer transition-colors hover:bg-red-50 hover:border-red-300"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          @click="handleGenerate"
          class="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none py-1.5 px-4 rounded-md text-xs font-bold cursor-pointer transition-all hover:shadow-md hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5"
          :disabled="isLoading || !prompt.trim()"
        >
          <span v-if="isLoading" class="flex items-center gap-1.5">
            <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </span>
          <span v-else class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
            Bắt đầu tạo
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

