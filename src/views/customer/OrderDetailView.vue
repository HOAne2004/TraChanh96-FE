<script setup>
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useModalStore } from '@/stores/modal'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatters'
import { ORDER_STATUS, getOrderStatusConfig, getOrderTypeConfig } from '@/constants/order.constants'
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
import NavLink from '@/components/common/NavLink.vue'
import ReviewModal from '@/components/customer/review/ReviewModal.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { currentOrder, loading, error } = storeToRefs(orderStore)

// State xử lý
const isProcessingPayment = ref(false)
const showCancelModal = ref(false)
const isCancelling = ref(false)
const showPaymentModal = ref(false)
const isPaymentPendingLocal = ref(false)

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

const isBankingUnpaid = computed(() => {
  const order = currentOrder.value
  if (!order) return false
  const isBanking = order.paymentMethod?.bankAccountNumber && order.paymentMethod?.bankName
  return !order.isPaid && order.status !== ORDER_STATUS.CANCELLED && isBanking
})

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

  // 🟢 SỬA LỖI: Lấy PaymentMethodId an toàn
  // Ưu tiên lấy từ object lồng nhau (currentOrder.paymentMethod.id)
  // Nếu null, thử lấy từ root (currentOrder.paymentMethodId) nếu DTO có trả về
  const pmId = currentOrder.value.paymentMethod?.id || currentOrder.value.paymentMethodId
  // Nếu không tìm thấy ID phương thức thanh toán -> Báo lỗi và dừng
  if (!pmId) {
    toastStore.show({
      type: 'error',
      message: 'Lỗi dữ liệu: Không tìm thấy phương thức thanh toán.',
    })
    return
  }

  // 2. Logic kiểm tra Banking (Dùng Optional Chaining ?. cho an toàn)
  const type = currentOrder.value.paymentMethod?.paymentType

  // Logic hiển thị Modal QR chuyển khoản thủ công
  if (type === 'bankingTransfer' || isBankingUnpaid.value) {
    showPaymentModal.value = true
    return
  }

  // 3. Logic gọi API thanh toán Online (VNPay/Momo...)
  isProcessingPayment.value = true
  try {
    const response = await api.post('/order-payments/charge', {
      orderId: currentOrder.value.id,
      paymentMethodId: pmId, // 🟢 Sử dụng ID đã lấy an toàn ở trên
    })

    const result = response.data

    if (result.paymentUrl) {
      // Chuyển hướng sang trang thanh toán
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
  const isConfirmed = await modalStore.confirmAction(
    'Bạn có chắc chắn muốn hoàn tất đơn hàng này?',
    'Xác nhận hoàn tất đơn hàng',
  )

  if (!isConfirmed) return

  try {
    // Chỉ thay đổi text / giao diện thay vì gọi API update status vì trạng thái RECEIVED bên BE là trạng thái cuối, gọi thêm sẽ lỗi ngầm.
    if (currentOrder.value) {
      currentOrder.value.status = ORDER_STATUS.COMPLETED
    }
    toastStore.show({ type: 'success', message: 'Cảm ơn bạn đã mua hàng!' })
  } catch (e) {
    console.error(e)
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
            <!-- Dòng trên: Icon + Text + Thời gian -->
            <div class="flex flex-row items-center gap-2 mb-1">
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
              <span class="text-xl font-bold font-mono">{{ timeLeft }}</span>
            </div>

            <!-- Dòng dưới: Chú thích -->
            <span class="text-xs text-gray-500 ml-7">
              Đơn hàng sẽ tự hủy khi chưa được nhân viên xác nhận
            </span>
          </div>
        </div>

        <div
          :class="`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${statusMeta.color}`"
        >
          <span>
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
                :d="statusMeta.iconPath"
              />
            </svg>
          </span>
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
