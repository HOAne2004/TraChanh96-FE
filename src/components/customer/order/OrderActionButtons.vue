<script setup>
import { computed } from 'vue'
import { ORDER_STATUS } from '@/constants/order.constants'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  order: { type: Object, required: true },
  userRole: { type: String, default: 'Customer' },
  isPaymentPending: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'pay', 'confirm', 'complete'])

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
  return props.userRole === 'Customer' &&
         [ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(s)
})

// 2. Logic Nút Thanh toán (Chỉ Online & Chưa trả & Chưa hoàn tất)
const showPayBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  const isPaid = props.order.isPaid

  // Nếu là COD (PaymentType = 1 hoặc tên có chữ COD/Tiền mặt) -> Ẩn
  const type = props.order.paymentMethod?.paymentType
  const name = props.order.paymentMethod?.name?.toLowerCase() || ''
  const isCOD = type === 1 || type === 0 || name.includes('cod') || name.includes('tiền mặt')

  if (isCOD) return false // 👈 Chặn COD ở đây luôn cho chắc

  return !isPaid &&
         ![ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(s) &&
         props.userRole === 'Customer'
})

// 3. Logic Nút "Đã nhận hàng" (MỚI: Cho khách xác nhận hoàn tất)
const showCompleteBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  // Chỉ hiện khi trạng thái là ĐANG GIAO (Delivering) hoặc ĐÃ NHẬN (Received - Tại quầy)
  // Và chưa hoàn tất (Completed)
  return props.userRole === 'Customer' &&
         [ORDER_STATUS.DELIVERING, ORDER_STATUS.RECEIVED].includes(s)
})

// 4. Logic Admin (Giữ nguyên)
const showConfirmBtn = computed(() => {
  const s = normalizeStatus(props.order.status)
  return ['Staff', 'Admin', 'Manager'].includes(props.userRole) && s === ORDER_STATUS.NEW
})
</script>

<template>
  <div class="flex gap-3 justify-end mt-4">

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
      v-if="showConfirmBtn"
      label="Xác nhận đơn"
      variant="primary"
      @click="$emit('confirm')"
    />

  </div>
</template>
