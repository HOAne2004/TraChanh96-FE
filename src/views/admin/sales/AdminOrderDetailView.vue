<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useAdminStore } from '@/stores/admin' // Để lấy danh sách Shipper
import { formatDate, formatPrice } from '@/utils/formatters'
import { ORDER_STATUS, ORDER_STATUS_UI } from '@/constants/order.constants'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const adminStore = useAdminStore()

const { currentOrder: order, loading } = storeToRefs(orderStore)
const { users } = storeToRefs(adminStore) // Dùng để list ra shippers

// --- COMPUTED ---

// Lọc ra danh sách nhân viên có thể làm Shipper (Role = Staff hoặc Shipper)
const shipperOptions = computed(() => {
  if (!users.value) return []
  return users.value.filter(u =>
    u.role.toLowerCase() === 'shipper' || u.role.toLowerCase() === 'staff'
  )
})

// Config hiển thị trạng thái hiện tại
const currentStatusConfig = computed(() => {
  if (!order.value) return {}
  return ORDER_STATUS_UI[order.value.status] || {}
})

// Kiểm tra xem đơn có được phép hủy không (Chỉ hủy khi Mới hoặc Chờ thanh toán)
const canCancel = computed(() => {
  if (!order.value) return false
  return [ORDER_STATUS.NEW, ORDER_STATUS.PENDING_PAYMENT].includes(order.value.status)
})

// --- ACTIONS ---

// Tải dữ liệu
const fetchData = async () => {
  const code = route.params.code
  if (code) {
    await Promise.all([
      orderStore.fetchOrderDetail(code),
      adminStore.fetchAllUsers() // Tải user để lấy list shipper
    ])
  }
}

// Xử lý chuyển trạng thái (State Machine đơn giản hóa)
const updateStatus = async (newStatus) => {
  if (!confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?')) return
  try {
    await orderStore.updateStatusAction(order.value.id, newStatus)
  } catch (e) {
    alert(e)
  }
}

// Xử lý gán Shipper
const selectedShipperId = ref('')
const assignShipper = async () => {
  if (!selectedShipperId.value) return
  try {
    await orderStore.assignShipperAction(order.value.id, selectedShipperId.value)
    alert('Đã gán shipper thành công!')
  } catch (e) {
    alert(e)
  }
}

// Xử lý hủy đơn
const cancelReason = ref('')
const isCancelModalOpen = ref(false)
const handleCancelOrder = async () => {
  if (!cancelReason.value) return alert('Vui lòng nhập lý do hủy')
  try {
    await orderStore.cancelOrderAction(order.value.id, 'Khác', cancelReason.value)
    isCancelModalOpen.value = false
  } catch (e) {
    alert(e)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="order" class="max-w-7xl mx-auto">

      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Đơn hàng #{{ order.orderCode }}
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1',
                  currentStatusConfig.color
                ]"
              >
                <svg v-if="currentStatusConfig.iconPath" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                   <path fill-rule="evenodd" clip-rule="evenodd" :d="currentStatusConfig.iconPath" />
                </svg>
                {{ currentStatusConfig.label }}
              </span>
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Đặt lúc: {{ formatDate(order.createdAt) }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            In hóa đơn
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="lg:col-span-2 space-y-6">

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
              Chi tiết món ăn
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500">
                  <tr>
                    <th class="px-6 py-3">Sản phẩm</th>
                    <th class="px-6 py-3 text-center">SL</th>
                    <th class="px-6 py-3 text-right">Đơn giá</th>
                    <th class="px-6 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="item in order.items" :key="item.id">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <img
                          :src="item.productImage || 'https://via.placeholder.com/50'"
                          class="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          alt="Product"
                        >
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ item.productName }}</p>
                          <p class="text-xs text-gray-500 mt-0.5">
                            Size: {{ item.sizeName || 'M' }}
                            <span v-if="item.sugarLevel || item.iceLevel">
                              | {{ item.sugarLevel }}% đường, {{ item.iceLevel }}% đá
                            </span>
                          </p>
                          <p v-if="item.note" class="text-xs text-orange-500 italic mt-1">Ghi chú: {{ item.note }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center text-gray-700 dark:text-gray-300">x{{ item.quantity }}</td>
                    <td class="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{{ formatPrice(item.basePrice + (item.sizePrice || 0)) }}</td>
                    <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">{{ formatPrice(item.finalPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex flex-col gap-3 max-w-xs ml-auto">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(order.totalAmount) }} đ</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Phí vận chuyển:</span>
                <span>{{ formatPrice(order.shippingFee) }} đ</span>
              </div>
              <div v-if="order.discountAmount" class="flex justify-between text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>- {{ formatPrice(order.discountAmount) }} đ</span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Tổng cộng:</span>
                <span class="text-green-600">{{ formatPrice(order.grandTotal) }} đ</span>
              </div>
              <div class="text-right text-xs text-gray-500">
                Thanh toán: <span class="font-medium">{{ order.paymentMethodName || 'Tiền mặt' }}</span>
                <span v-if="order.isPaid" class="ml-2 text-green-600 font-bold">(Đã thanh toán)</span>
                <span v-else class="ml-2 text-orange-600 font-bold">(Chưa thanh toán)</span>
              </div>
            </div>
          </div>

        </div>

        <div class="lg:col-span-1 space-y-6">

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Xử lý đơn hàng</h3>
            <div class="flex flex-col gap-3">

              <button
                v-if="order.status === ORDER_STATUS.NEW"
                @click="updateStatus(ORDER_STATUS.CONFIRMED)"
                class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Xác nhận đơn hàng
              </button>

              <button
                v-if="order.status === ORDER_STATUS.CONFIRMED"
                @click="updateStatus(ORDER_STATUS.PREPARING)"
                class="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>
                Bắt đầu pha chế
              </button>

              <div v-if="order.status === ORDER_STATUS.PREPARING && order.orderType !== 'AtCounter'" class="space-y-3">
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Chọn Shipper</label>
                  <div class="flex gap-2">
                    <select v-model="selectedShipperId" class="flex-1 text-sm border-gray-300 rounded focus:ring-green-500">
                      <option value="" disabled>-- Chọn nhân viên --</option>
                      <option v-for="s in shipperOptions" :key="s.id" :value="s.id">{{ s.name }} ({{ s.phone }})</option>
                    </select>
                    <button
                      @click="assignShipper"
                      :disabled="!selectedShipperId"
                      class="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                    >Gán</button>
                  </div>
                </div>
              </div>

              <button
                v-if="order.status === ORDER_STATUS.DELIVERING"
                @click="updateStatus(ORDER_STATUS.COMPLETED)"
                class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Đã giao thành công
              </button>

              <button
                v-if="canCancel"
                @click="isCancelModalOpen = true"
                class="w-full py-2.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Hủy đơn hàng
              </button>

            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Thông tin khách hàng</h3>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ order.recipientName || order.userName }}</p>
                <p class="text-sm text-gray-500">{{ order.recipientPhone }}</p>
                <p v-if="order.userId" class="text-xs text-blue-500 mt-1 cursor-pointer hover:underline">Xem hồ sơ khách hàng</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
              {{ order.isAtCounter ? 'Nhận tại cửa hàng' : 'Địa chỉ giao hàng' }}
            </h3>

            <div v-if="!order.isAtCounter" class="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ order.shippingAddress }}
              </p>
            </div>

            <div v-if="order.shipperName" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 mb-2">Shipper phụ trách:</p>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                  S
                </div>
                <div>
                  <p class="text-sm font-medium">{{ order.shipperName }}</p>
                  <p class="text-xs text-gray-500">{{ order.shipperPhone }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div v-if="isCancelModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Hủy đơn hàng</h3>
        <p class="text-sm text-gray-500 mb-4">Hành động này không thể hoàn tác. Vui lòng nhập lý do:</p>

        <textarea
          v-model="cancelReason"
          rows="3"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm mb-4"
          placeholder="Ví dụ: Khách gọi điện báo hủy..."
        ></textarea>

        <div class="flex justify-end gap-3">
          <button
            @click="isCancelModalOpen = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >Đóng</button>
          <button
            @click="handleCancelOrder"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >Xác nhận Hủy</button>
        </div>
      </div>
    </div>

  </div>
</template>
