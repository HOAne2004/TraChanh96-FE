<script setup>
import { computed } from 'vue'
import { ORDER_STATUS } from '@/constants/order.constants'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  order: { type: Object, required: true },
  userRole: { type: String, default: 'Customer' }
})

const emit = defineEmits(['cancel', 'pay', 'confirm', 'ship', 'complete'])

// --- HÀM HELPER: CHUYỂN ĐỔI TRẠNG THÁI (STRING -> INT) ---
const normalizeStatus = (status) => {
  if (typeof status === 'number') return status

  // Chuyển "New" -> "NEW" -> 0
  const key = status?.toString().toUpperCase()

  // Mapping đặc biệt nếu tên BE khác tên Constant FE
  if (key === 'PENDINGPAYMENT') return ORDER_STATUS.PENDING_PAYMENT

  return ORDER_STATUS[key] !== undefined ? ORDER_STATUS[key] : -1
}

// --- LOGIC HIỂN THỊ NÚT CHO KHÁCH HÀNG ---
const showCancelBtn = computed(() => {
  const currentStatusId = normalizeStatus(props.order.status)

  // Khách chỉ được hủy khi đơn Mới (0) hoặc Chờ thanh toán (7)
  return props.userRole === 'Customer' &&
         [ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(currentStatusId)
})

const showPayBtn = computed(() => {
  // Logic hiển thị nút thanh toán (đã nhận từ props bên ngoài OrderDetailView,
  // nhưng nếu component này đứng một mình thì logic dưới đây là fallback)

  // Lưu ý: Ở OrderDetailView ta đã có logic showPayButton truyền vào rồi
  // Nhưng nếu dùng logic nội tại thì cũng phải normalize status
  const currentStatusId = normalizeStatus(props.order.status)

  const isPaid = props.order.isPaid
  const isCancelledOrCompleted = [ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(currentStatusId)

  return !isPaid && !isCancelledOrCompleted && props.userRole === 'Customer'
})

// --- LOGIC CHO STAFF/ADMIN ---
const showConfirmBtn = computed(() => {
  const currentStatusId = normalizeStatus(props.order.status)
  return ['Staff', 'Admin', 'Manager'].includes(props.userRole) &&
         currentStatusId === ORDER_STATUS.NEW
})

</script>

<template>
  <div class="flex gap-3 justify-end mt-4">

    <Button v-if="showCancelBtn"
            label="Hủy đơn hàng"
            variant="danger-outline"
            @click="$emit('cancel')" />

    <Button v-if="$attrs.showPayButton ?? showPayBtn"
            label="Thanh toán ngay"
            variant="primary"
            @click="$emit('pay')" />

    <Button v-if="showConfirmBtn"
            label="Xác nhận đơn"
            variant="primary"
            @click="$emit('confirm')" />

    </div>
</template>
