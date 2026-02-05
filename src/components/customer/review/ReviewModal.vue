<script setup>
import { ref, watch } from 'vue'
import { useReviewStore } from '@/stores/review'
import { useUploadStore } from '@/stores/upload'
import Button from '@/components/common/Button.vue'

// Props nhận vào từ trang Order
const props = defineProps({
  isOpen: Boolean,
  product: Object, // Sản phẩm đang được đánh giá (để hiện tên/ảnh)
  orderId: Number, // Order ID của đơn hàng chứa sản phẩm này
})

const emit = defineEmits(['close', 'success'])
const reviewStore = useReviewStore()
const uploadStore = useUploadStore()

const rating = ref(5)
const content = ref('')
const mediaUrl = ref('')

// Reset form mỗi khi mở modal
watch(() => props.isOpen, (val) => {
  if (val) {
    rating.value = 5
    content.value = ''
    mediaUrl.value = ''
  }
})

// Xử lý upload ảnh (Giữ nguyên logic của bạn)
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    const url = await uploadStore.uploadFileAction(file)
    mediaUrl.value = url
  } catch (error) {
    alert('Lỗi upload ảnh.')
  }
}

const handleSubmit = async () => {
  if (!props.orderId || !props.product?.id) {
    alert('Lỗi dữ liệu. Vui lòng thử lại.')
    return
  }

  const success = await reviewStore.submitReview({
    orderId: props.orderId,
    productId: props.product.id, // 🔥 Quan trọng
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
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div v-if="product" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl mb-4">
         <img :src="product.imageUrl" class="w-12 h-12 rounded object-cover" />
         <div>
            <p class="font-bold text-sm text-gray-800 dark:text-white">{{ product.name }}</p>
            <p class="text-xs text-gray-500">{{ product.sizeName }}</p>
         </div>
      </div>

      <div class="flex justify-center mb-6 gap-2">
         <button
            v-for="star in 5"
            :key="star"
            @click="rating = star"
            class="text-3xl transition-transform hover:scale-110 focus:outline-none"
            :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
         >
            ★
         </button>
      </div>
      <p class="text-center text-sm font-bold text-gray-600 mb-4">
         {{ rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Tệ' }}
      </p>

      <div class="space-y-4">
        <textarea
          v-model="content"
          rows="3"
          placeholder="Chất lượng món ăn, thời gian giao hàng..."
          class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none resize-none"
        ></textarea>

        <div class="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 text-center">
            <div v-if="!mediaUrl && !uploadStore.loading">
                <label class="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium">Chọn ảnh đính kèm</span>
                    <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                </label>
            </div>

            <div v-else-if="uploadStore.loading" class="text-green-600 text-sm font-medium animate-pulse">
                Đang tải ảnh lên...
            </div>

            <div v-else class="relative inline-block group">
                <img :src="mediaUrl" class="h-24 w-24 object-cover rounded-lg shadow-sm" />
                <button @click="mediaUrl = ''" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1" title="Xóa">✕</button>
            </div>
        </div>
      </div>

      <div class="mt-8 flex gap-3">
        <Button label="Hủy" variant="secondary" class="flex-1" @click="$emit('close')" />
        <Button
          :label="reviewStore.submitting ? 'Đang gửi...' : 'Gửi đánh giá'"
          :disabled="reviewStore.submitting || uploadStore.loading"
          class="flex-1"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>
