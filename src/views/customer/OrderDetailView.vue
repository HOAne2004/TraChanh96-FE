<script setup>
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatters'
import { ORDER_STATUS_UI, ORDER_STATUS, ORDER_TYPE_UI } from '@/constants/order.constants'
import api from '@/services/axiosClient'

// Components
import OrderTimeline from '@/components/customer/order/OrderTimeline.vue'
import OrderActionButtons from '@/components/customer/order/OrderActionButtons.vue'
import Button from '@/components/common/Button.vue'
import OrderCancelModal from '@/components/common/order/OrderCancelModal.vue'
import OrderDetailItems from '@/components/common/order/OrderDetailItems.vue'
import OrderSummaryCard from '@/components/common/order/OrderSummaryCard.vue'
import OrderContactInfo from '@/components/common/order/OrderContactInfo.vue'
import OrderPaymentModal from '@/components/common/order/OrderPaymentModal.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const toastStore = useToastStore()
const { currentOrder, loading, error } = storeToRefs(orderStore)

// State xử lý
const isProcessingPayment = ref(false)
const showCancelModal = ref(false)
const isCancelling = ref(false)
const showPaymentModal = ref(false)
const isPaymentPendingLocal = ref(false)

// --- COMPUTED ---
const statusMeta = computed(() => {
  if (!currentOrder.value) return {}
  return (
    ORDER_STATUS_UI[currentOrder.value.status] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-600',
      icon: '📦',
    }
  )
})

const isBankingUnpaid = computed(() => {
  const order = currentOrder.value
  if (!order) return false
  const isBanking = order.paymentMethod?.bankAccountNumber && order.paymentMethod?.bankName
  return !order.isPaid && order.status !== ORDER_STATUS.CANCELLED && isBanking
})

const orderTypeMeta = computed(() => {
  if (!currentOrder.value) return {}
  return (
    ORDER_TYPE_UI[currentOrder.value.orderType] || {
      label: 'Khác',
      color: 'bg-gray-100 text-gray-600',
    }
  )
})

const showPayButton = computed(() => {
  const order = currentOrder.value
  if (!order || order.isPaid || order.status === ORDER_STATUS.CANCELLED) return false
  const type = order.paymentMethod?.paymentType
  if (type === 'COD' || type === 'Cash' || type === 1) return false
  return true
})

// --- ACTIONS ---

const onCancelClick = () => {
  showCancelModal.value = true
}

const submitCancelOrder = async ({ reason, note }) => {
  isCancelling.value = true
  try {
    await orderStore.cancelOrderAction(currentOrder.value.id, {
      reason: reason,
      note: note,
    })
    toastStore.show({ type: 'success', message: 'Đã hủy đơn hàng thành công.' })
    showCancelModal.value = false
    orderStore.fetchOrderDetail(currentOrder.value.orderCode)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: e.message || 'Không thể hủy đơn.' })
  } finally {
    isCancelling.value = false
  }
}

const handlePayment = async () => {
  if (!currentOrder.value) return
  const type = currentOrder.value.paymentMethod?.paymentType
  if (type === 'Banking' || type === 'BankTransfer' || type === 2 || isBankingUnpaid.value) {
    showPaymentModal.value = true
    return
  }

  isProcessingPayment.value = true
  try {
    const response = await api.post('/order-payments/charge', {
      orderId: currentOrder.value.id,
      paymentMethodId: currentOrder.value.paymentMethod.id,
    })

    const result = response.data

    if (result.paymentUrl) {
      window.location.href = result.paymentUrl
    } else {
      toastStore.show({ type: 'success', message: 'Đã gửi yêu cầu thanh toán.' })
      orderStore.fetchOrderDetail(currentOrder.value.orderCode)
    }
  } catch (err) {
    console.error(err)
    toastStore.show({
      type: 'error',
      message: err.response?.data?.message || 'Không thể khởi tạo thanh toán.',
    })
  } finally {
    isProcessingPayment.value = false
  }
}

const onPaymentConfirm = () => {
  showPaymentModal.value = false
  isPaymentPendingLocal.value = true
  toastStore.show({ type: 'info', message: 'Đã gửi yêu cầu. Vui lòng chờ nhân viên xác nhận.' })
}

// --- LOGIC BỘ ĐẾM NGƯỢC (AUTO CANCEL) ---
const timeLeft = ref('')
const isExpired = ref(false)
let timerInterval = null

const startCountdown = () => {
  if (!currentOrder.value) return

  // 🛠️ FIX TIMEZONE: Ép kiểu về UTC bằng cách thêm 'Z' nếu thiếu
  let dateStr = currentOrder.value.createdAt
  if (!dateStr.endsWith('Z')) {
    dateStr += 'Z'
  }

  const createdTime = new Date(dateStr).getTime()
  const expireTime = createdTime + 5 * 60 * 1000 // 5 phút

  // Hàm tính toán
  const calculate = () => {
    const now = new Date().getTime()
    const distance = expireTime - now

    if (distance < 0) {
      // Đã hết giờ
      if (timerInterval) clearInterval(timerInterval)
      timeLeft.value = '00:00'
      isExpired.value = true
      // Không gọi API liên tục, chỉ đánh dấu expired
    } else {
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      timeLeft.value = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
  }

  // Gọi ngay lần đầu tiên (không đợi 1s)
  calculate()

  // Nếu chưa hết hạn thì mới chạy interval
  if (!isExpired.value) {
    timerInterval = setInterval(calculate, 1000)
  }
  // console.log('--- DEBUG COUNTDOWN ---')
  // console.log('Order Status:', currentOrder.value.status)
  // console.log('Created At (Gốc):', currentOrder.value.createdAt)
  // console.log('Created Time (Milisecond):', createdTime)
  // console.log('Current Time (Milisecond):', now)
  // console.log('Expire Time  (Milisecond):', expireTime)
  // console.log('Distance (Còn lại):', expireTime - now)
  // console.log('-----------------------')
}

const onCompleteOrder = async () => {
  if(!confirm('Bạn xác nhận đã nhận được hàng và muốn hoàn tất đơn này?')) return

  try {
     // Gọi API update status sang COMPLETED
     // Lưu ý: Cần đảm bảo API cho phép Customer update status này, hoặc tạo endpoint riêng
     await orderStore.updateStatusAction(currentOrder.value.id, ORDER_STATUS.COMPLETED)
     toastStore.show({ type: 'success', message: 'Cảm ơn bạn đã mua hàng!' })
     orderStore.fetchOrderDetail(currentOrder.value.orderCode)
  } catch (e) {
     toastStore.show({ type: 'error', message: e.message || 'Lỗi cập nhật' })
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

onMounted(async () => {
  if (route.params.code) {
    await orderStore.fetchOrderDetail(route.params.code)

    if ([ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(currentOrder.value.status)) {
      startCountdown()
    }
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p class="text-gray-500">Đang tải thông tin đơn hàng...</p>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500 text-lg mb-4">⚠️ {{ error }}</p>
      <Button label="Quay lại trang chủ" @click="router.push('/')" variant="secondary" />
    </div>

    <div v-else-if="currentOrder" class="space-y-6 animate-fade-in">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4"
      >
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
              Đơn hàng #{{ currentOrder.orderCode }}
            </h1>
            <span :class="`text-xs px-2 py-0.5 rounded font-bold uppercase ${orderTypeMeta.color}`">
              {{ orderTypeMeta.label }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Đặt lúc: {{ formatDate(currentOrder.createdAt) }}
          </p>
        </div>
        <div
          v-if="
            !isExpired &&
            [ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(currentOrder.status)
          "
          class="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-pulse"
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium">Tự hủy sau:</span>
          </div>
          <span class="text-xl font-bold font-mono ml-2">{{ timeLeft }}</span>
        </div>
        <div
          :class="`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${statusMeta.color}`"
        >
          <span>{{ statusMeta.icon }}</span>
          {{ statusMeta.label }}
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-x-auto border border-gray-100 dark:border-gray-700"
      >
        <OrderTimeline :current-status="currentOrder.status" :order-type="currentOrder.orderType" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <OrderDetailItems :items="currentOrder.items" user-role="Customer" />
        </div>

        <div class="space-y-6">
          <OrderContactInfo :order="currentOrder" />

          <OrderSummaryCard :order="currentOrder">
            <template #actions>
              <OrderActionButtons
                :order="currentOrder"
                user-role="Customer"
                :show-pay-button="showPayButton"
                :is-payment-pending="isPaymentPendingLocal"
                @pay="handlePayment"
                @cancel="onCancelClick"
                @complete="onCompleteOrder"
              />
              <OrderCancelModal
                :show="showCancelModal"
                :is-loading="isCancelling"
                @close="showCancelModal = false"
                @submit="submitCancelOrder"
              />
            </template>
          </OrderSummaryCard>
        </div>
      </div>
    </div>
    <OrderPaymentModal
      v-if="currentOrder"
      :show="showPaymentModal"
      :order="currentOrder"
      @close="showPaymentModal = false"
      @confirm="onPaymentConfirm"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
