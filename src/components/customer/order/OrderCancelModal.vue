<script setup>
import { ref } from 'vue'

defineProps({
  show: Boolean,
  isLoading: Boolean
})

const emit = defineEmits(['close', 'submit'])

// Map Enum từ Backend sang Danh sách hiển thị
// CustomerChangedMind = 1, CustomerOrderWrong = 2, Other = 99
const cancelReasons = [
  { value: 1, label: 'Tôi muốn đổi ý / Không muốn mua nữa' },
  { value: 2, label: 'Tôi đặt nhầm món / Nhầm địa chỉ' },
  { value: 99, label: 'Lý do khác (Nhập chi tiết bên dưới)' }
]

const selectedReason = ref(null)
const otherReasonNote = ref('')
const error = ref('')

const handleSubmit = () => {
  error.value = ''

  if (!selectedReason.value) {
    error.value = 'Vui lòng chọn lý do hủy đơn.'
    return
  }

  // Nếu chọn "Lý do khác" (99) thì bắt buộc nhập Note
  if (selectedReason.value === 99 && !otherReasonNote.value.trim()) {
    error.value = 'Vui lòng nhập chi tiết lý do.'
    return
  }

  emit('submit', {
    reason: selectedReason.value,
    note: otherReasonNote.value
  })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl p-6 relative z-10 animate-fade-in-up">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Hủy đơn hàng</h3>

      <p class="text-sm text-gray-500 mb-4">
        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
      </p>

      <div class="space-y-3 mb-4">
        <div
          v-for="option in cancelReasons"
          :key="option.value"
          @click="selectedReason = option.value"
          class="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
          :class="selectedReason === option.value ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'"
        >
          <div class="w-4 h-4 rounded-full border flex items-center justify-center mr-3"
               :class="selectedReason === option.value ? 'border-red-500' : 'border-gray-400'">
            <div v-if="selectedReason === option.value" class="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ option.label }}</span>
        </div>
      </div>

      <div v-if="selectedReason === 99" class="animate-fade-in">
        <textarea
          v-model="otherReasonNote"
          rows="2"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-transparent"
          placeholder="Nhập lý do chi tiết..."
        ></textarea>
      </div>

      <p v-if="error" class="text-xs text-red-500 mt-2 font-bold">{{ error }}</p>

      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Đóng
        </button>
        <button
          @click="handleSubmit"
          :disabled="isLoading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-lg shadow-red-200 disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Xác nhận hủy
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
