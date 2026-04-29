<script setup>
import { computed } from 'vue'
import { ORDER_STATUS, ORDER_STATUS_UI } from '@/constants/order.constants'

const props = defineProps({
  currentStatus: { type: [Number, String], required: true },
  orderType: { type: [String, Number], default: 'Delivery' },
})

const normalizeStatus = (status) => {
  let statusId = status
  if (typeof status === 'string') {
    const key = status.toUpperCase()
    statusId = ORDER_STATUS[key] !== undefined ? ORDER_STATUS[key] : -1
    if (key === 'PENDINGPAYMENT') statusId = ORDER_STATUS.PENDING_PAYMENT
  }

  if (statusId === ORDER_STATUS.PENDING_PAYMENT) {
    return ORDER_STATUS.NEW
  }

  return statusId
}

const timelineSteps = computed(() => {
  const commonSteps = [
    ORDER_STATUS.NEW, // 0
    ORDER_STATUS.CONFIRMED, // 1
    ORDER_STATUS.PREPARING, // 2
    ORDER_STATUS.READY, // 3
  ]

  if (props.orderType === 'AtCounter') {
    return [...commonSteps, ORDER_STATUS.RECEIVED] // 4
  }

  // Default Delivery
  return [...commonSteps, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED] // 5, 6
})

const isStepActive = (stepValue) => {
  const currentId = normalizeStatus(props.currentStatus)

  if (currentId === ORDER_STATUS.CANCELLED) return false

  const currentIndex = timelineSteps.value.indexOf(currentId)
  const stepIndex = timelineSteps.value.indexOf(stepValue)

  if (currentIndex === -1) {
    return currentId >= stepValue
  }

  return stepIndex <= currentIndex
}
</script>

<template>
  <div class="flex items-center justify-between w-full px-4 py-6">
    <div
      v-for="(step, index) in timelineSteps"
      :key="step"
      class="relative flex flex-col items-center flex-1"
    >
      <div
        v-if="index !== 0"
        class="absolute top-4 right-1/2 w-full h-1 -translate-y-1/2 transition-colors duration-300"
        :class="isStepActive(step) ? 'bg-green-500' : 'bg-gray-200'"
      ></div>

      <div
        class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300"
        :class="
          isStepActive(step)
            ? 'bg-green-500 border-green-500 text-white scale-110'
            : 'bg-white border-gray-300 text-gray-300'
        "
      >
        <span v-if="isStepActive(step) && normalizeStatus(currentStatus) > step">✓</span>
        <span v-else>{{ index + 1 }}</span>
      </div>

      <div
        class="mt-2 text-xs font-medium text-center transition-colors duration-300"
        :class="isStepActive(step) ? 'text-green-600 font-bold' : 'text-gray-400'"
      >
        {{ ORDER_STATUS_UI[step]?.label }}
      </div>
    </div>
  </div>
</template>
