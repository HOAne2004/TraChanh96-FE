<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useToastStore } from '@/stores/toast'
import { ORDER_STATUS_UI } from '@/constants/order.constants'
import { formatPrice } from '@/utils/formatters'
import api from '@/services/axiosClient'

// Components
import OrderTimeline from '@/components/customer/order/OrderTimeline.vue'
import OrderActionButtons from '@/components/customer/order/OrderActionButtons.vue'
import Button from '@/components/common/Button.vue'
import OrderCancelModal from '@/components/customer/order/OrderCancelModal.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const toastStore = useToastStore()
const { currentOrder, loading, error } = storeToRefs(orderStore)

// State xử lý thanh toán lại
const isProcessingPayment = ref(false)
// State xử lý hủy đơn
const showCancelModal = ref(false)
const isCancelling = ref(false)
const onCancelClick = () => {
  showCancelModal.value = true
}

const submitCancelOrder = async ({ reason, note }) => {
  isCancelling.value = true
  try {
    // Gọi Action trong Store
    // Lưu ý: Store cần nhận object { reason, note } đúng theo DTO
    await orderStore.cancelOrderAction(currentOrder.value.id, {
      reason: reason,
      note: note,
    })

    toastStore.show({ type: 'success', message: 'Đã hủy đơn hàng thành công.' })
    showCancelModal.value = false

    // Reload lại trang để cập nhật trạng thái
    orderStore.fetchOrderDetail(currentOrder.value.orderCode)
  } catch (e) {
    console.error(e)
    toastStore.show({ type: 'error', message: e.message || 'Không thể hủy đơn.' })
  } finally {
    isCancelling.value = false
  }
}

onMounted(() => {
  if (route.params.code) {
    orderStore.fetchOrderDetail(route.params.code)
  }
})

// --- COMPUTED ---

// 1. Metadata hiển thị trạng thái (Màu sắc, Icon)
const statusMeta = computed(() => {
  if (!currentOrder.value) return {}
  return (
    ORDER_STATUS_UI[currentOrder.value.status] || {
      label: currentOrder.value.statusLabel || 'Trạng thái',
      color: 'bg-gray-100 text-gray-600',
      icon: '📦',
    }
  )
})

// 2. Kiểm tra xem có phải đơn Banking chưa thanh toán không (Để hiện QR)
const isBankingUnpaid = computed(() => {
  const order = currentOrder.value
  if (!order) return false
  return (
    !order.isPaid && order.status !== 'Cancelled' && order.paymentMethod?.paymentType === 'Banking'
  )
})

// 3. Logic ẩn/hiện nút "Thanh toán" (Cho OrderActionButtons)
// Chỉ hiện nút này cho Ví điện tử bị lỗi/chưa thanh toán.
// Banking đã có QR nên không cần nút này. COD thì không cần.
const showPayButton = computed(() => {
  const order = currentOrder.value
  if (!order || order.isPaid || order.status === 'Cancelled') return false

  // Lấy PaymentType (backend trả về string: "COD", "Cash", "Banking", "EWallet")
  const type = order.paymentMethod?.paymentType

  // Nếu là Banking -> Ẩn nút (vì đã có QR code ở trên)
  // Nếu là COD/Cash -> Ẩn nút
  if (type === 'Banking' || type === 'Cash' || type === 'COD') return false

  // Chỉ hiện nếu là EWallet (để retry)
  return type === 'EWallet'
})

// --- ACTIONS ---

// Thanh toán lại (Dành cho Ví điện tử)
const handlePayment = async () => {
  if (!currentOrder.value) return
  isProcessingPayment.value = true

  try {
    // Gọi API Backend để lấy URL thanh toán mới
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

// Copy số tài khoản
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  toastStore.show({ type: 'success', message: 'Đã sao chép số tài khoản!' })
}
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
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
              {{ currentOrder.orderType === 'Delivery' ? 'Giao hàng' : 'Tại quầy' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Đặt lúc: {{ new Date(currentOrder.createdAt).toLocaleString('vi-VN') }}
          </p>
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

      <div
        v-if="isBankingUnpaid"
        class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-md border border-blue-200 dark:border-blue-800 p-6"
      >
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="shrink-0 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <p class="text-xs font-bold text-center text-gray-500 mb-2 uppercase tracking-wide">
              Quét mã để thanh toán
            </p>
            <img
              :src="`https://img.vietqr.io/image/${currentOrder.paymentMethod.bankName}-${currentOrder.paymentMethod.bankAccountNumber}-${currentOrder.paymentMethod.qrTplUrl || 'compact2'}.png?amount=${currentOrder.grandTotal}&addInfo=${currentOrder.orderCode}&accountName=${currentOrder.paymentMethod.bankAccountName}`"
              class="w-48 h-48 object-contain"
              alt="VietQR Payment"
            />
          </div>

          <div class="flex-1 space-y-3 w-full">
            <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Thông tin chuyển khoản
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <p class="text-gray-500 text-xs">Ngân hàng</p>
                <p class="font-bold text-gray-800 dark:text-white">
                  {{ currentOrder.paymentMethod.bankName }}
                </p>
              </div>
              <div
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative group cursor-pointer"
                @click="copyToClipboard(currentOrder.paymentMethod.bankAccountNumber)"
              >
                <p class="text-gray-500 text-xs">Số tài khoản</p>
                <p class="font-bold text-gray-800 dark:text-white text-lg font-mono">
                  {{ currentOrder.paymentMethod.bankAccountNumber }}
                </p>
                <span
                  class="absolute right-3 top-3 text-blue-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >Sao chép</span
                >
              </div>
              <div
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <p class="text-gray-500 text-xs">Chủ tài khoản</p>
                <p class="font-bold text-gray-800 dark:text-white uppercase">
                  {{ currentOrder.paymentMethod.bankAccountName }}
                </p>
              </div>
              <div
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
              >
                <p class="text-gray-500 text-xs">Số tiền cần trả</p>
                <p class="font-bold text-green-700 dark:text-green-400 text-xl">
                  {{ formatPrice(currentOrder.grandTotal) }}
                </p>
              </div>
            </div>

            <div
              class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-lg border border-yellow-200 dark:border-yellow-700 flex items-start gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span class="font-bold">Nội dung chuyển khoản:</span>
                <span
                  class="font-mono bg-white dark:bg-black px-2 py-0.5 rounded mx-1 font-bold border border-yellow-300 select-all"
                  >{{ currentOrder.orderCode }}</span
                >
                <p class="mt-1 text-xs opacity-90">
                  {{
                    currentOrder.paymentMethod.instructions ||
                    'Hệ thống sẽ tự động cập nhật trạng thái sau ít phút.'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div
              class="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 flex justify-between"
            >
              <span>Chi tiết sản phẩm</span>
              <span
                class="text-xs font-normal text-gray-500 bg-white dark:bg-gray-600 px-2 py-1 rounded-full border"
              >
                {{ currentOrder.items.length }} món
              </span>
            </div>

            <div class="p-4 space-y-6">
              <div
                v-for="item in currentOrder.items"
                :key="item.id"
                class="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div
                  class="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    :src="item.productImage || '/default-food.png'"
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <h4 class="font-bold text-gray-800 dark:text-white text-base line-clamp-2">
                      {{ item.productName }}
                    </h4>
                    <p class="font-bold text-gray-900 dark:text-white whitespace-nowrap ml-2">
                      {{ formatPrice(item.totalPrice) }}
                    </p>
                  </div>

                  <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span
                      v-if="item.sizeName"
                      class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
                      >Size: {{ item.sizeName }}</span
                    >
                    <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{
                      item.sugarLevel
                    }}</span>
                    <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{
                      item.iceLevel
                    }}</span>
                  </div>

                  <div
                    v-if="item.toppings && item.toppings.length > 0"
                    class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm"
                  >
                    <p class="text-[10px] uppercase text-gray-400 font-bold mb-1">Topping thêm:</p>
                    <ul class="space-y-1">
                      <li
                        v-for="top in item.toppings"
                        :key="top.id"
                        class="flex justify-between text-gray-600 dark:text-gray-300 text-xs"
                      >
                        <span>+ {{ top.productName }}</span>
                        <span>{{ formatPrice(top.finalPrice) }}</span>
                      </li>
                    </ul>
                  </div>

                  <p class="text-sm font-medium text-gray-600 mt-2">
                    Số lượng: x{{ item.quantity }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          >
            <h3 class="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Thông tin nhận hàng
            </h3>
            <div
              class="text-sm space-y-3 relative pl-3 border-l-2 border-gray-200 dark:border-gray-700 ml-2"
            >
              <div>
                <span class="block text-xs text-gray-400 uppercase font-bold">Người nhận</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >{{ currentOrder.recipientName }} - {{ currentOrder.recipientPhone }}</span
                >
              </div>
              <div>
                <span class="block text-xs text-gray-400 uppercase font-bold">Địa chỉ</span>
                <span class="font-medium text-gray-900 dark:text-white">{{
                  currentOrder.shippingAddress
                }}</span>
              </div>
              <div v-if="currentOrder.userNotes">
                <span class="block text-xs text-gray-400 uppercase font-bold">Ghi chú</span>
                <span class="italic text-gray-600 dark:text-gray-300"
                  >"{{ currentOrder.userNotes }}"</span
                >
              </div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4 border border-gray-100 dark:border-gray-700"
          >
            <h3 class="font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">
              Tổng thanh toán
            </h3>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tổng tiền hàng</span>
                <span>{{ formatPrice(currentOrder.totalAmount) }}</span>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Phí vận chuyển</span>
                <span>+ {{ formatPrice(currentOrder.shippingFee || 0) }}</span>
              </div>
              <div
                v-if="currentOrder.discountAmount"
                class="flex justify-between text-green-600 font-medium"
              >
                <span>Voucher giảm giá</span>
                <span>- {{ formatPrice(currentOrder.discountAmount) }}</span>
              </div>

              <div class="border-t border-dashed border-gray-300 my-2"></div>

              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800 dark:text-white">Thành tiền</span>
                <span class="text-xl font-extrabold text-green-600">{{
                  formatPrice(currentOrder.grandTotal)
                }}</span>
              </div>

              <div class="flex justify-between items-center pt-2">
                <span class="text-xs text-gray-500">Phương thức:</span>
                <span class="text-xs font-bold">{{
                  currentOrder.paymentMethod?.name || 'COD'
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Trạng thái TT:</span>
                <span
                  :class="
                    currentOrder.isPaid ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'
                  "
                >
                  {{ currentOrder.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN' }}
                </span>
              </div>
            </div>

            <div class="mt-6 border-t pt-4">
              <OrderActionButtons
                :order="currentOrder"
                user-role="Customer"
                :show-pay-button="showPayButton"
                @cancel="onCancelClick"
                @pay="handlePayment"
              />
              <OrderCancelModal
                :show="showCancelModal"
                :is-loading="isCancelling"
                @close="showCancelModal = false"
                @submit="submitCancelOrder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
