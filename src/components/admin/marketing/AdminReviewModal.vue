<script setup>
import { ref, watch } from 'vue'
import { useReviewStore } from '@/stores/review'
import { getReviewStatusOptions } from '@/constants/review.constants'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  isOpen: Boolean,
  review: Object // Review đang được chọn để xử lý
})

const emit = defineEmits(['close', 'success'])
const reviewStore = useReviewStore()

const status = ref(2) // Mặc định Approved (2) - Cần khớp với Enum BE của bạn
const adminResponse = ref('')

// Enum Status (Cần khớp với Backend)
const STATUS_OPTIONS = getReviewStatusOptions()

// Reset form khi mở modal
watch(() => props.review, (newVal) => {
  if (newVal) {
    // Map status từ string sang số nếu cần, hoặc giữ nguyên nếu BE trả về số
    // Ở đây giả định BE trả về status dạng số hoặc string khớp value
    status.value = newVal.status
    adminResponse.value = newVal.adminResponse || ''
  }
})

const handleSubmit = async () => {
  if (!props.review) return

  const payload = {
    status: status.value,
    adminResponse: adminResponse.value
  }

  const success = await reviewStore.updateReviewStatusOrReply(props.review.id, payload)
  if (success) {
    emit('success')
    emit('close')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">

      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">Phản hồi đánh giá</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div v-if="review" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 text-sm">
        <div class="flex justify-between mb-2">
            <span class="font-bold">{{ review.userName }}</span>
            <span class="text-yellow-600 font-bold">{{ review.rating }} ★</span>
        </div>
        <p class="text-gray-600 dark:text-gray-300 italic">"{{ review.content }}"</p>
      </div>

      <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái hiển thị</label>
            <select v-model="status" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-green-500">
              <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Câu trả lời của Admin</label>
            <textarea
                v-model="adminResponse"
                rows="4"
                placeholder="Nhập nội dung phản hồi khách hàng..."
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-green-500 resize-none"
            ></textarea>
        </div>
      </div>

      <div class="mt-8 flex gap-3 justify-end">
        <Button label="Hủy" variant="secondary" @click="$emit('close')" />
        <Button
            :label="reviewStore.submitting ? 'Đang lưu...' : 'Lưu thay đổi'"
            :disabled="reviewStore.submitting"
            @click="handleSubmit"
        />
      </div>

    </div>
  </div>
</template>
