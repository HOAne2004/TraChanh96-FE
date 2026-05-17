<script setup>
import { computed } from 'vue'
import { ORDER_STATUS, ORDER_STATUS_UI } from '@/constants/order.constants'

const props = defineProps({
  currentStatus: { type: [Number, String], required: true },
  orderType: { type: [String, Number], default: 'Delivery' },
})

const normalizeStatus = (status) => {
  if (typeof status === 'string') {
    const key = status.toUpperCase()
    if (key === 'PENDINGPAYMENT') return ORDER_STATUS.PENDING_PAYMENT
    return ORDER_STATUS[key] !== undefined ? ORDER_STATUS[key] : status
  }
  return status
}

// Flatten PendingPayment -> NEW for timeline progress
const displayStatus = computed(() => {
  const s = normalizeStatus(props.currentStatus)
  if (s === ORDER_STATUS.PENDING_PAYMENT) return ORDER_STATUS.NEW
  return s
})

const isPickup = computed(() => {
  const t = String(props.orderType).toLowerCase()
  return t === 'pickup' || t === '2'
})

const isAtCounter = computed(() => {
  const t = String(props.orderType).toLowerCase()
  return t === 'atcounter' || t === '3'
})

// Mỗi step: { status, label, icon }
const timelineSteps = computed(() => {
  if (isPickup.value) {
    // Luồng Đến lấy
    return [
      { status: ORDER_STATUS.NEW, label: 'Đặt đơn' },
      { status: ORDER_STATUS.CONFIRMED, label: 'Xác nhận' },
      { status: ORDER_STATUS.PREPARING, label: 'Pha chế' },
      { status: ORDER_STATUS.READY, label: 'Sẵn sàng' },
      { status: ORDER_STATUS.RECEIVED, label: 'Đã lấy' },
    ]
  }
  if (isAtCounter.value) {
    // Luồng Tại quầy
    return [
      { status: ORDER_STATUS.NEW, label: 'Đặt đơn' },
      { status: ORDER_STATUS.CONFIRMED, label: 'Xác nhận' },
      { status: ORDER_STATUS.PREPARING, label: 'Pha chế' },
      { status: ORDER_STATUS.READY, label: 'Sẵn sàng' },
      { status: ORDER_STATUS.RECEIVED, label: 'Hoàn tất' },
    ]
  }
  // Luồng Giao hàng (mặc định)
  return [
    { status: ORDER_STATUS.NEW, label: 'Đặt đơn' },
    { status: ORDER_STATUS.CONFIRMED, label: 'Xác nhận' },
    { status: ORDER_STATUS.PREPARING, label: 'Pha chế' },
    { status: ORDER_STATUS.DELIVERING, label: 'Đang giao' },
    { status: ORDER_STATUS.COMPLETED, label: 'Đã nhận' },
  ]
})

const isCancelled = computed(() => {
  const s = normalizeStatus(props.currentStatus)
  return s === ORDER_STATUS.CANCELLED
})

const isStepActive = (stepStatus) => {
  if (isCancelled.value) return false

  const current = displayStatus.value
  const steps = timelineSteps.value.map((s) => s.status)
  const currentIndex = steps.indexOf(current)
  const stepIndex = steps.indexOf(stepStatus)

  // Nếu current không trong danh sách steps, dùng so sánh trực tiếp
  if (currentIndex === -1) {
    return current >= stepStatus
  }

  return stepIndex <= currentIndex
}

const isCurrentStep = (stepStatus) => {
  if (isCancelled.value) return false
  return displayStatus.value === stepStatus
}
</script>

<template>
  <div class="px-2 py-4">
    <!-- Normal Timeline -->
    <div v-if="!Canceled" class="flex items-start justify-between w-full">
      <div
        v-for="(step, index) in timelineSteps"
        :key="step.status"
        class="relative flex flex-col items-center flex-1"
      >
        <!-- Connector line -->
        <div
          v-if="index !== 0"
          class="absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-500"
          :class="isStepActive(step.status) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'"
        />

        <!-- Circle -->
        <div
          class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300"
          :class="[
            isStepActive(step.status)
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-300',
            isCurrentStep(step.status) ? 'scale-125 shadow-lg shadow-green-200 dark:shadow-green-900/40' : '',
          ]"
        >
          <svg
            v-if="isStepActive(step.status) && !isCurrentStep(step.status)"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span v-else class="text-xs font-bold">{{ index + 1 }}</span>
        </div>

        <!-- Label -->
        <div
          class="mt-2 text-xs font-medium text-center leading-tight transition-colors duration-300 px-0.5"
          :class="[
            isStepActive(step.status) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500',
            isCurrentStep(step.status) ? 'font-bold' : '',
          ]"
        >
          {{ step.label }}
        </div>
      </div>
    </div>

    <!-- Pickup note -->
    <p
      v-if="isPickup && !isCancelled"
      class="mt-3 text-xs text-center text-blue-500 dark:text-blue-400"
    >
      🛍️ Đơn lấy tại cửa hàng — Mang mã QR đến nhận đồ khi trạng thái là "Sẵn sàng"
    </p>
  </div>
</template>

