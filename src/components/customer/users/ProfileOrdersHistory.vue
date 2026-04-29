<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate, formatPrice } from '@/utils/formatters'
import Button from '@/components/ui/AppButton.vue'
import { ORDER_STATUS_UI } from '@/constants/order.constants'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
})

const router = useRouter()

// --- LOGIC PHÂN TRANG (PAGINATION) ---
const ITEMS_PER_PAGE = 10 // 👉 Giới hạn 10 đơn hàng/trang
const currentPage = ref(1) // Trang hiện tại

// Tính tổng số trang
const totalPages = computed(() => {
  if (!props.orders || props.orders.length === 0) return 0
  return Math.ceil(props.orders.length / ITEMS_PER_PAGE)
})

// 💡 Đảm bảo rằng khi props.orders thay đổi (ví dụ: tải xong),
// trang hiện tại được đặt lại về 1 để tránh lỗi khi trang đang chọn không tồn tại.
watch(
  () => props.orders,
  () => {
    if (currentPage.value > totalPages.value || currentPage.value < 1) {
      currentPage.value = 1
    }
  },
  { immediate: true },
)

// Danh sách đơn hàng cho trang hiện tại
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return props.orders.slice(start, end)
})

// --- LOGIC ĐỊNH DẠNG VÀ TRẠNG THÁI ---

const getStatusConfig = (statusNumber) => {
  // statusNumber bây giờ là số (0, 1, 6...)
  // Lấy config từ object ORDER_STATUS_UI
  const config = ORDER_STATUS_UI[statusNumber]

  // Nếu không tìm thấy (lỗi dữ liệu), trả về mặc định
  if (!config) {
    return {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
  }

  return config
}

const hasOrders = computed(() => props.orders && props.orders.length > 0)

// Hàm điều hướng
const goToOrderDetail = (orderCode) => {
  if (orderCode) {
    router.push(`/orders/${orderCode}`)
  }
}

// Chức năng chuyển trang
const goToPage = (page) => {
  const targetPage = Math.max(1, Math.min(page, totalPages.value))
  if (targetPage !== currentPage.value) {
    currentPage.value = targetPage
    // Cuộn lên đầu trang sau khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <h3 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">
      Lịch sử Đơn hàng ({{ orders.length }})
    </h3>

    <div v-if="isLoading" class="text-center py-10 text-lg text-green-600 dark:text-green-400">
      <p class="mt-4">Đang tải lịch sử đơn hàng...</p>
    </div>

    <div v-else-if="!hasOrders" class="text-center py-10">
      <p class="text-lg text-gray-500 dark:text-gray-400">
        Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
      </p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in paginatedOrders"
        :key="order.id"
        @click="goToOrderDetail(order.orderCode)"
        class="border dark:border-gray-700 p-4 rounded-lg shadow-sm transition duration-150 hover:shadow-md cursor-pointer"
      >
        <div class="flex justify-between items-start mb-3 border-b dark:border-gray-700 pb-2">
          <div>
            <span class="text-sm font-semibold text-gray-600 dark:text-gray-400 block"
              >Mã Đơn hàng:</span
            >
            <span class="text-xl font-bold text-green-700 dark:text-green-400"
              >#{{ order.orderCode }}</span
            >
          </div>

          <div
            :class="`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${getStatusConfig(order.status).color}`"
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
                  :d="getStatusConfig(order.status).iconPath"
                />
              </svg>
            </span>
            {{ getStatusConfig(order.status).label }}
          </div>
        </div>

        <div class="text-sm space-y-2">
          <p class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Ngày đặt:</span>
            <span class="font-medium">{{ formatDate(order.createdAt) }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Địa chỉ giao hàng:</span>
            <span class="font-medium text-right max-w-[70%]">{{
              order.shippingAddress || order.address
            }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Phương thức thanh toán:</span>
            <span class="font-medium">
              {{
                order.paymentMethod?.name ||
                (order.paymentMethod === 'cash' ? 'COD' : 'Chuyển khoản')
              }}
            </span>
          </p>
          <div
            class="border-t pt-2 mt-2 dark:border-gray-700 flex justify-between font-bold text-lg"
          >
            <span>TỔNG CỘNG:</span>
            <span class="text-red-600 dark:text-red-400">{{
              formatPrice(order.grandTotal || order.totalAmount)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8"></div>
  </div>
</template>
