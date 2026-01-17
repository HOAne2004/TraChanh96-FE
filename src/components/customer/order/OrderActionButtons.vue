<script setup>
import { computed, ref } from 'vue'
import { ORDER_STATUS } from '@/constants/order.constants'
import Button from '@/components/common/Button.vue'
import PickupQrModal from '@/components/common/order/PickupQrModal.vue'

const props = defineProps({
  order: { type: Object, required: true },
  userRole: { type: String, default: 'Customer' },
  isPaymentPending: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'pay', 'confirm', 'complete'])

const showQrModal = ref(false)

// Helper normalize
const normalizeStatus = (status) => {
  if (typeof status === 'number') return status
  const key = status?.toString().toUpperCase()
  if (key === 'PENDINGPAYMENT') return ORDER_STATUS.PENDING_PAYMENT
  return ORDER_STATUS[key] !== undefined ? ORDER_STATUS[key] : -1
}

// 1. Logic Nút Hủy (Chỉ khi Mới hoặc Chờ thanh toán)
const showCancelBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  return (
    props.userRole === 'Customer' && [ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(s)
  )
})

// 2. Logic Nút Thanh toán (Chỉ Online & Chưa trả & Chưa hoàn tất)
const showPayBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  const isPaid = props.order.isPaid

  // Nếu là COD (PaymentType = 1 hoặc tên có chữ COD/Tiền mặt) -> Ẩn
  const type = props.order.paymentMethod?.paymentType
  const name = props.order.paymentMethod?.name?.toLowerCase() || ''
  const isCOD = type === 1 || name.includes('cod') || name.includes('tiền mặt')

  if (isCOD) return false // 👈 Chặn COD ở đây luôn cho chắc

  return (
    !isPaid &&
    ![ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(s) &&
    props.userRole === 'Customer'
  )
})

// 3. Logic Nút "Đã nhận hàng" (MỚI: Cho khách xác nhận hoàn tất)
const showCompleteBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  // Chỉ hiện khi trạng thái là ĐANG GIAO (Delivering) hoặc ĐÃ NHẬN (Received - Tại quầy)
  // Và chưa hoàn tất (Completed)
  return (
    props.userRole === 'Customer' && [ORDER_STATUS.DELIVERING].includes(s)
  )
})

// 4. Logic Admin (Giữ nguyên)
const showConfirmBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  return ['Staff', 'Admin', 'Manager'].includes(props.userRole) && s === ORDER_STATUS.NEW
})

// 🟢 5. [MỚI] Logic Nút "Lấy mã nhận đồ" (QR)
// Helper xác định đơn Pickup (Check cả string và số cho chắc chắn)
const isPickupOrder = computed(() => {
  const type = props.order?.orderType
  // Giả sử 2 là Enum của Pickup
  return type === 'pickup'
})
const showPickupQrBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  const hasCode = !!props.order.pickupCode
  const isValidStatus = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.RECEIVED,
  ].includes(s)

  // Tái sử dụng computed vừa tạo
  return props.userRole === 'Customer' && isPickupOrder.value && hasCode && isValidStatus
})
</script>

<template>
  <div class="flex gap-3 justify-end mt-4 flex-wrap">
    <Button
      v-if="showPickupQrBtn && order.status !== ORDER_STATUS.RECEIVED"
      label="Mã nhận đồ"
      variant="primary"
      class="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
      @click="showQrModal = true"
    >
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
          />
        </svg>
      </template>
    </Button>

    <Button
      v-if="showCancelBtn"
      label="Hủy đơn hàng"
      variant="danger-outline"
      :disabled="isPaymentPending"
      @click="$emit('cancel')"
    />

    <Button
      v-if="$attrs.showPayButton ?? showPayBtn"
      :label="isPaymentPending ? 'Đang chờ xác nhận...' : 'Thanh toán ngay'"
      :variant="isPaymentPending ? 'secondary' : 'primary'"
      :disabled="isPaymentPending"
      @click="$emit('pay')"
    />

    <Button
      v-if="showCompleteBtn"
      label="Đã nhận hàng"
      variant="primary"
      @click="$emit('complete')"
    />

    <Button
      v-if="showConfirmBtn && !isPickupOrder"
      label="Xác nhận đơn"
      variant="primary"
      @click="$emit('confirm')"
    />

   <div
        v-if="order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.RECEIVED"
        class="w-full py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg font-bold text-center flex justify-center items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Đơn hàng đã hoàn tất
      </div>
  </div>

  <PickupQrModal :show="showQrModal" :pickup-code="order.pickupCode" @close="showQrModal = false" />
</template>
