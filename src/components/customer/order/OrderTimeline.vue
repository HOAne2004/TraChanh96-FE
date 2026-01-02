<script setup>
import { computed } from 'vue'
import { ORDER_STATUS, ORDER_STATUS_UI } from '@/constants/order.constants'

const props = defineProps({
  currentStatus: { type: [Number, String], required: true }, // Nhận cả String từ BE
  orderType: { type: String, default: 'Delivery' }
})

// 1. Hàm chuyển đổi Status String (BE) -> Status ID (FE Constants)
const normalizeStatus = (status) => {
  if (typeof status === 'number') return status

  // Chuyển "New" -> "NEW" -> lấy giá trị từ ORDER_STATUS
  const key = status?.toString().toUpperCase()

  // Mapping đặc biệt: PendingPayment (7) cũng coi như là New (0) trên Timeline
  if (key === 'PENDINGPAYMENT') return ORDER_STATUS.NEW

  return ORDER_STATUS[key] !== undefined ? ORDER_STATUS[key] : -1
}

// 2. Định nghĩa các bước Timeline
const timelineSteps = computed(() => {
  const commonSteps = [
    ORDER_STATUS.NEW,       // 0
    ORDER_STATUS.CONFIRMED, // 1
    ORDER_STATUS.PREPARING, // 2
  ]

  if (props.orderType === 'AtCounter') {
    return [...commonSteps, ORDER_STATUS.RECEIVED] // 6
  }

  // Default Delivery
  return [...commonSteps, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED] // 3, 4
})

// 3. Logic kiểm tra Active
const isStepActive = (stepValue) => {
  const currentId = normalizeStatus(props.currentStatus)

  // Nếu đơn bị Hủy -> Không active bước nào (hoặc xử lý riêng màu đỏ)
  if (currentId === ORDER_STATUS.CANCELLED) return false

  // Logic: Tìm vị trí (index) của trạng thái hiện tại trong timeline
  // Ví dụ: Timeline [0, 1, 2]. Hiện tại là 1.
  // Thì bước 0 (index 0) <= index 1 -> Active
  // Bước 1 (index 1) <= index 1 -> Active
  // Bước 2 (index 2) > index 1 -> Inactive

  const currentIndex = timelineSteps.value.indexOf(currentId)
  const stepIndex = timelineSteps.value.indexOf(stepValue)

  // Nếu trạng thái hiện tại không nằm trong timeline (VD: New nhưng timeline bắt đầu từ Confirmed?)
  // Fallback: So sánh giá trị số
  if (currentIndex === -1) {
      return currentId >= stepValue
  }

  return stepIndex <= currentIndex
}
</script>

<template>
  <div class="flex items-center justify-between w-full px-4 py-6">
    <div v-for="(step, index) in timelineSteps" :key="step" class="relative flex flex-col items-center flex-1">

      <div v-if="index !== 0"
           class="absolute top-4 right-1/2 w-full h-1 -translate-y-1/2 transition-colors duration-300"
           :class="isStepActive(step) ? 'bg-green-500' : 'bg-gray-200'">
      </div>

      <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300"
           :class="isStepActive(step) ? 'bg-green-500 border-green-500 text-white scale-110' : 'bg-white border-gray-300 text-gray-300'">
        <span v-if="isStepActive(step) && normalizeStatus(currentStatus) > step">✓</span>
        <span v-else>{{ index + 1 }}</span>
      </div>

      <div class="mt-2 text-xs font-medium text-center transition-colors duration-300"
           :class="isStepActive(step) ? 'text-green-600 font-bold' : 'text-gray-400'">
        {{ ORDER_STATUS_UI[step]?.label }}
      </div>
    </div>
  </div>
</template>
