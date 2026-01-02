<script setup>
import { ref, watch } from 'vue'
import { useReviewStore } from '@/stores/review'
import { useUploadStore } from '@/stores/upload' // [1] Import Store Upload
import Button from '@/components/common/Button.vue'

const props = defineProps({
  isOpen: Boolean,
  product: Object,
  orderId: Number,
})

const emit = defineEmits(['close', 'success'])
const reviewStore = useReviewStore()
const uploadStore = useUploadStore() // [2] Khởi tạo

const rating = ref(5)
const content = ref('')
const mediaUrl = ref('')

// Reset form
watch(() => props.isOpen, (val) => {
  if (val) {
    rating.value = 5
    content.value = ''
    mediaUrl.value = ''
  }
})

// [3] Hàm xử lý Upload ảnh
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Gọi action upload từ store (file Upload.js bạn đã có)
    const url = await uploadStore.uploadFileAction(file)
    mediaUrl.value = url // Gán link ảnh trả về vào biến để gửi đi
  } catch (error) {
    alert('Không thể tải ảnh lên. Vui lòng thử lại.')
  }
}

const handleSubmit = async () => {
  if (!props.orderId) {
    alert('Lỗi: Không tìm thấy mã đơn hàng.')
    return
  }

  // Nếu đang upload dở thì chặn lại
  if (uploadStore.loading) {
    alert('Vui lòng đợi ảnh tải lên hoàn tất.')
    return
  }

  const success = await reviewStore.submitReview({
    orderId: props.orderId,
    productId: props.product.id,
    rating: rating.value,
    content: content.value,
    mediaUrl: mediaUrl.value
  })

  if (success) {
    emit('success')
    emit('close')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
    <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl transform transition-all scale-100">

      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Đánh giá sản phẩm</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="space-y-4 mt-6">
        <textarea
          v-model="content"
          rows="3"
          placeholder="Hãy chia sẻ cảm nhận của bạn về món này nhé..."
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none resize-none"
        ></textarea>

        <div class="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 text-center">

            <div v-if="!mediaUrl && !uploadStore.loading">
                <label class="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium">Chọn ảnh đính kèm</span>
                    <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                </label>
            </div>

            <div v-else-if="uploadStore.loading" class="text-green-600 text-sm font-medium animate-pulse flex justify-center items-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải ảnh lên...
            </div>

            <div v-else class="relative inline-block group">
                <img :src="mediaUrl" class="h-24 w-24 object-cover rounded-lg shadow-sm" />
                <button
                    @click="mediaUrl = ''"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    title="Xóa ảnh"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </div>

      <div class="mt-8 flex gap-3">
        <Button label="Hủy" variant="secondary" class="flex-1" @click="$emit('close')" />
        <Button
          :label="reviewStore.submitting || uploadStore.loading ? 'Đang xử lý...' : 'Gửi đánh giá'"
          :disabled="reviewStore.submitting || uploadStore.loading"
          class="flex-1"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>
