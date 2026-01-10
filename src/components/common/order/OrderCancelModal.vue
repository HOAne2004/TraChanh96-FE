<script setup>
import { ref, computed, watch } from 'vue'
import { CANCEL_REASON_UI } from '@/constants/order.constants' //
import Button from '@/components/common/Button.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  userRole: { type: String, default: 'Customer' } // 'Customer' | 'Admin' | 'Staff'
})

const emit = defineEmits(['close', 'submit'])

const selectedReason = ref(null)
const otherReasonNote = ref('')

// Reset form khi mở modal
watch(() => props.show, (val) => {
  if (val) {
    selectedReason.value = null
    otherReasonNote.value = ''
  }
})

// Lọc lý do hủy phù hợp với vai trò
const availableReasons = computed(() => {
  return Object.entries(CANCEL_REASON_UI)
    .map(([key, value]) => ({
      id: Number(key),
      label: value.label,
      type: value.type
    }))
    .filter(r => {
      if (props.userRole === 'Customer') {
        // Khách chỉ thấy lý do của khách hoặc 'other'
        return r.type === 'customer' || r.type === 'other'
      } else {
        // Admin/Staff thấy lý do của cửa hàng, vận chuyển, hoặc 'other'
        // (Ẩn lý do "Khách đổi ý" vì Admin không nên chọn hộ cái đó, hoặc tùy bạn)
        return ['store', 'delivery', 'system', 'other'].includes(r.type)
      }
    })
})

const handleSubmit = () => {
  if (!selectedReason.value) return

  // Emit data về cha
  emit('submit', {
    reason: selectedReason.value, // ID lý do (Enum)
    note: otherReasonNote.value   // Ghi chú thêm
  })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
      
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          {{ userRole === 'Customer' ? 'Hủy đơn hàng' : 'Xác nhận Hủy đơn' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          ✕
        </button>
      </div>

      <div class="p-6 space-y-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Vui lòng chọn lý do hủy đơn hàng <span class="font-bold text-gray-900 dark:text-white">#{{ $attrs.orderCode }}</span>:
        </p>

        <div class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          <label 
            v-for="reason in availableReasons" 
            :key="reason.id"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
            :class="selectedReason === reason.id 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
          >
            <input 
              type="radio" 
              :value="reason.id" 
              v-model="selectedReason"
              class="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ reason.label }}</span>
          </label>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú thêm (Tùy chọn)</label>
          <textarea
            v-model="otherReasonNote"
            rows="2"
            class="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Chi tiết thêm..."
          ></textarea>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
        <Button 
          label="Đóng" 
          variant="secondary" 
          @click="$emit('close')" 
          :disabled="isLoading"
        />
        <Button 
          label="Xác nhận Hủy" 
          variant="danger" 
          :loading="isLoading"
          :disabled="!selectedReason"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>