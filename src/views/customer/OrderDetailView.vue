<script setup>
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/sales/order.store'
import { useModalStore } from '@/stores/system/modal.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useNotificationStore } from '@/stores/marketing/notification.store'
import { formatDate } from '@/utils/formatters'
import { ORDER_STATUS, getOrderStatusConfig, getOrderTypeConfig } from '@/constants/order.constants'

// Components
import OrderTimeline from '@/components/customer/sales/OrderTimeline.vue'
import OrderActionButtons from '@/components/customer/sales/OrderActionButtons.vue'
import Button from '@/components/ui/AppButton.vue'
import OrderCancelModal from '@/components/customer/sales/OrderCancelModal.vue'
import OrderDetailItems from '@/components/customer/sales/OrderDetailItems.vue'
import OrderSummaryCard from '@/components/customer/sales/OrderSummaryCard.vue'
import OrderContactInfo from '@/components/customer/sales/OrderContactInfo.vue'
import OrderPaymentModal from '@/components/customer/sales/OrderPaymentModal.vue'
import NavLink from '@/components/ui/NavLink.vue'
import ReviewModal from '@/components/customer/catalog/ReviewModal.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const notificationStore = useNotificationStore()
const { currentOrder, loading, error } = storeToRefs(orderStore)

// State xử lý
const showCancelModal = ref(false)
const isCancelling = ref(false)
const showPaymentModal = ref(false)

// State mới cho Review
const showReviewModal = ref(false)
const reviewProductData = ref(null)

const onOpenReview = (item) => {
  // Map dữ liệu từ OrderItem sang format hiển thị trên Modal
  reviewProductData.value = {
    id: item.productId, // ProductId (quan trọng để gửi API)
    name: item.productName,
    imageUrl: item.productImage,
    sizeName: item.sizeName,
  }
  showReviewModal.value = true
}

const reviewedProductIds = computed(() => {
  const reviews = currentOrder.value?.reviews || []
  return reviews.map((r) => r.productId)
})

const onReviewSuccess = async () => {
  toastStore.show({ type: 'success', message: 'Đánh giá của bạn đã được ghi nhận!' })
  if (currentOrder.value?.orderCode) {
    await orderStore.fetchOrderDetail(currentOrder.value.orderCode)
  }
}

// --- COMPUTED ---

const statusMeta = computed(() => {
  if (!currentOrder.value) return {}
  return getOrderStatusConfig(currentOrder.value.status)
})

const orderTypeMeta = computed(() => {
  if (!currentOrder.value) return {}
  return getOrderTypeConfig(currentOrder.value.orderType)
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
  // 1. Kiểm tra đơn hàng tồn tại
  if (!currentOrder.value) return

  // Ưu tiên lấy từ object lồng nhau (currentOrder.paymentMethod.id)
  const pmId = currentOrder.value.paymentMethod?.id || currentOrder.value.paymentMethodId
  if (!pmId) {
    toastStore.show({
      type: 'error',
      message: 'Lỗi dữ liệu: Không tìm thấy phương thức thanh toán.',
    })
    return
  }

  // Gọi API để báo Backend biết khách đang chuẩn bị thanh toán (tạo record Pending)
  try {
    const result = await orderStore.processOnlinePaymentAction(currentOrder.value.id, pmId)

    if (result?.paymentUrl) {
      // Có URL redirect (VNPAY, Momo...) → chuyển hướng
      window.location.href = result.paymentUrl
    } else {
      // Không có URL → luồng VietQR tĩnh → hiển thị Modal QR
      toastStore.show({ type: 'info', message: 'Vui lòng quét mã QR để thanh toán.' })
      showPaymentModal.value = true
    }
  } catch (err) {
    console.error(err)
    toastStore.show({
      type: 'error',
      message: err.response?.data?.message || 'Không thể khởi tạo thanh toán.',
    })
  }
}


// --- LOGIC BỘ ĐẾM NGƯỢC (AUTO CANCEL) ---
const timeLeft = ref('')
const isExpired = ref(false)
let timerInterval = null

const startCountdown = () => {
  if (!currentOrder.value) return

  let dateStr = currentOrder.value.createdAt
  if (!dateStr.endsWith('Z')) {
    dateStr += 'Z'
  }

  const createdTime = new Date(dateStr).getTime()
  const expireTime = createdTime + 5 * 60 * 1000 // 5 phút

  const calculate = () => {
    const now = new Date().getTime()
    const distance = expireTime - now

    if (distance < 0) {
      if (timerInterval) clearInterval(timerInterval)
      timeLeft.value = '00:00'
      isExpired.value = true
    } else {
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      timeLeft.value = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
  }

  calculate()

  if (!isExpired.value) {
    timerInterval = setInterval(calculate, 1000)
  }
}

const onCompleteOrder = async () => {
  const isConfirmed = await modalStore.confirmAction(
    'Bạn có chắc chắn muốn hoàn tất đơn hàng này?',
    'Xác nhận hoàn tất đơn hàng',
  )

  if (!isConfirmed) return

  try {
    if (currentOrder.value) {
      currentOrder.value.status = ORDER_STATUS.COMPLETED
    }
    toastStore.show({ type: 'success', message: 'Cảm ơn bạn đã mua hàng!' })
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: e.message || 'Lỗi cập nhật' })
  }
}

const handleSignalRNotification = async (notification) => {
  if (
    notification?.referenceId &&
    currentOrder.value?.orderCode &&
    notification.referenceId === currentOrder.value.orderCode
  ) {
    const updatedOrder = await orderStore.fetchOrderDetail(currentOrder.value.orderCode)
    if (updatedOrder && updatedOrder.status === ORDER_STATUS.CANCELLED) {
      if (timerInterval) clearInterval(timerInterval)
    }
  }
}

const autoCancelMinutes = ref(5)

// 1. VIẾT LẠI HÀM LẮNG NGHE SIGNALR DÀNH RIÊNG CHO TRẠNG THÁI ĐƠN
const handleOrderStatusChanged = async (orderId, newStatusStr) => {
  // So sánh ID (Dùng == để an toàn kiểu dữ liệu)
  if (currentOrder.value && currentOrder.value.id == orderId) {
    // Gọi API fetch lại toàn bộ chi tiết đơn để lấy luôn lý do hủy, giờ hủy...
    await orderStore.fetchOrderDetail(currentOrder.value.orderCode)
    
    // Nếu đơn bị hủy, dọn dẹp bộ đếm
    if (currentOrder.value.status === ORDER_STATUS.CANCELLED) {
      if (timerInterval) clearInterval(timerInterval)
      isExpired.value = true
    }
  }
}

// --- LIFECYCLE HOOK MỚI ---
onMounted(async () => {
  if (notificationStore.connection) {
    notificationStore.connection.on('ReceiveNotification', handleSignalRNotification)
  }

  // 1. Đón kết quả trả về từ VNPay (query trên URL)
  const paymentStatus = route.query.payment
  if (paymentStatus) {
    if (paymentStatus === 'success') {
      toastStore.show({
        message: 'Thanh toán VNPay thành công! Cảm ơn bạn.',
        type: 'success'
      })
    } else if (paymentStatus === 'failed') {
      toastStore.show({
        message: 'Thanh toán thất bại hoặc đã bị hủy.',
        type: 'error'
      })
    }

    // Xóa URL Params đi để user f5 trang không bị hiện Toast lại
    router.replace({
      name: route.name,
      params: route.params,
      query: {}
    })
  }

  // 2. Fetch data đơn hàng
  if (route.params.code) {
    await orderStore.fetchOrderDetail(route.params.code)

   if (currentOrder.value.status === ORDER_STATUS.PENDING_PAYMENT) {
      startCountdown() 
    }
  }

  if (notificationStore.connection) {
    notificationStore.connection.on("PaymentSuccess", async (receivedOrderId) => {
      if (currentOrder.value && currentOrder.value.id == receivedOrderId) {
        toastStore.show({ type: 'success', message: 'Thanh toán thành công! Cảm ơn bạn.' })
        showPaymentModal.value = false
        await orderStore.fetchOrderDetail(currentOrder.value.orderCode)
      }
    });

    notificationStore.connection.on("OrderStatusChanged", async (receivedOrderId) => {
      // Nếu ID đơn hàng thay đổi trùng với đơn mình đang xem
      if (currentOrder.value?.id == receivedOrderId) {
        // Tải lại dữ liệu mới nhất để cập nhật trạng thái (status)
        const updatedOrder = await orderStore.fetchOrderDetail(currentOrder.value.orderCode)

        // Nếu đơn bị chuyển sang Hủy hoặc Hoàn thành → dừng đếm ngược
        if (updatedOrder.status === ORDER_STATUS.CANCELLED || updatedOrder.status === ORDER_STATUS.COMPLETED) {
          if (timerInterval) clearInterval(timerInterval)
        }

        // Bật Toast báo động cho User
        toastStore.show({
          type: 'info', 
          message: 'Đơn hàng đã có cập nhật trạng thái mới!'
        })
      }
    });


  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (notificationStore.connection) {
    notificationStore.connection.off('ReceiveNotification', handleSignalRNotification)
    notificationStore.connection.off('PaymentSuccess')
    notificationStore.connection.off('OrderStatusChanged')
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
      <div class="text-sm text-gray-500 flex items-center gap-2">
        <NavLink to="/profile?tab=orders" label="Lịch sử đơn hàng" variant="secondary" />
        <span>/</span>
        <span class="font-semibold text-gray-800 dark:text-gray-200">{{
          currentOrder.orderCode
        }}</span>
      </div>
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
          <div class="flex flex-col items-left w-full">
            <div class="flex flex-row items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">Tự hủy sau:</span>
              <span class="text-xl font-bold font-mono">{{ timeLeft }}</span>
            </div>
            <span class="text-xs text-gray-500 ml-7">
              Đơn hàng sẽ tự hủy khi chưa được xác nhận
            </span>
          </div>
        </div>

        <div
          :class="`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shrink-0 ${statusMeta.color}`"
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusMeta.iconPath" />
            </svg>
          </span>
          {{ statusMeta.label }}
        </div>
      </div>

      <div
        v-if="currentOrder.status === ORDER_STATUS.CANCELLED"
        class="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl shadow-sm"
      >
        <div class="flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="font-bold text-base">Đơn hàng đã bị hủy</span>
        </div>
        <p class="text-sm ml-7">
          <span class="font-semibold">Lý do:</span> 
          {{ currentOrder.cancelReason || 'Không rõ lý do' }} 
          <span v-if="currentOrder.cancelNote"> - {{ currentOrder.cancelNote }}</span>
        </p>
      </div>

      <div
        v-if="currentOrder.status !== ORDER_STATUS.CANCELLED"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-x-auto border border-gray-100 dark:border-gray-700"
      >
        <OrderTimeline :current-status="currentOrder.status" :order-type="currentOrder.orderType" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <OrderDetailItems
            :items="currentOrder.items"
            :order-status="currentOrder.status"
            :allow-review="true"
            :reviewed-ids="reviewedProductIds"
            @review="onOpenReview"
          />
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
                :order-code="currentOrder?.orderCode"
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
    />
    <ReviewModal
      v-if="currentOrder"
      :is-open="showReviewModal"
      :product="reviewProductData"
      :order-id="currentOrder.id"
      @close="showReviewModal = false"
      @success="onReviewSuccess"
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
