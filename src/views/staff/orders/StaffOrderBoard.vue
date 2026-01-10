<script setup>
import { onMounted, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { ORDER_STATUS, ORDER_TYPE } from '@/constants/order.constants'
import { formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'

const orderStore = useOrderStore()
const toastStore = useToastStore()
const { orders: allOrders } = storeToRefs(orderStore)

const REFRESH_INTERVAL = 15000
let refreshTimer = null

// --- 1. Cột Đơn Mới (Bao gồm cả Chờ thanh toán) ---
const newOrders = computed(() => {
  return (allOrders.value || []).filter(o =>
    o.status === ORDER_STATUS.NEW ||
    o.status === ORDER_STATUS.PENDING_PAYMENT // Hiển thị cả đơn chờ CK để Staff check
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
})

// --- 2. Cột Đang Chế Biến ---
const preparingOrders = computed(() => {
  return (allOrders.value || []).filter(o =>
    o.status === ORDER_STATUS.CONFIRMED ||
    o.status === ORDER_STATUS.PREPARING
  ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
})

// --- 3. Cột Chờ Trả Hàng ---
const outgoingOrders = computed(() => {
  return (allOrders.value || []).filter(o =>
    o.status === ORDER_STATUS.READY ||
    o.status === ORDER_STATUS.DELIVERING ||
    o.status === ORDER_STATUS.RECEIVED
  ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
})

// --- ACTIONS ---
const fetchOrders = async () => {
  await orderStore.fetchOrders({ pageSize: 100 })
}

const handleUpdateStatus = async (orderId, newStatus) => {
  try {
    await orderStore.updateStatusAction(orderId, newStatus)
    toastStore.show({ type: 'success', message: 'Cập nhật thành công!' })
  } catch (error) {
    toastStore.show({ type: 'error', message: error.message })
  }
}

// Xử lý xác nhận thanh toán thủ công (Chuyển từ Pending -> Confirmed/New)
const handleConfirmPayment = async (order) => {
    if(!confirm(`Xác nhận đã nhận được tiền chuyển khoản cho đơn #${order.orderCode}?`)) return;

    // Khi xác nhận tiền, ta chuyển sang trạng thái CONFIRMED (để bếp làm luôn)
    // hoặc NEW (để chờ bếp nhận) tùy quy trình. Ở đây tôi chọn CONFIRMED cho nhanh.
    handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED);
}

const handleComplete = async (order) => {
  if (!confirm(`Hoàn tất đơn #${order.orderCode}?`)) return
  handleUpdateStatus(order.id, ORDER_STATUS.COMPLETED)
}

// --- HELPER ---
const getTimeElapsed = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  return minutes < 60 ? `${minutes}p trước` : `${Math.floor(minutes/60)}h trước`
}

onMounted(() => {
  fetchOrders()
  refreshTimer = setInterval(fetchOrders, REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 p-4 overflow-hidden flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        🍽️ Bếp & Pha Chế
        <span class="text-sm font-normal bg-white dark:bg-gray-700 px-3 py-1 rounded-full border shadow-sm">
           {{ newOrders.length + preparingOrders.length + outgoingOrders.length }} đơn
        </span>
      </h1>
      <button @click="fetchOrders" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <span>Làm mới</span>
      </button>
    </div>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden min-h-0">

      <div class="flex flex-col bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
          <h2 class="font-bold text-blue-800 dark:text-blue-200 uppercase">1. Tiếp Nhận</h2>
          <span class="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ newOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">

          <div v-for="order in newOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow relative">
            <div class="absolute top-3 right-3 flex flex-col items-end gap-1">
               <span v-if="order.orderType === ORDER_TYPE.AT_COUNTER" class="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Tại quán</span>
               <span v-else class="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Giao đi</span>

               <span v-if="order.status === ORDER_STATUS.PENDING_PAYMENT" class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse border border-red-200">
                 ⏳ Chờ CK
               </span>
            </div>

            <div class="mb-2">
               <span class="text-lg font-bold text-gray-800 dark:text-white">#{{ order.orderCode ? order.orderCode.slice(-4) : '...' }}</span>
               <p class="text-xs text-gray-500">{{ getTimeElapsed(order.createdAt) }}</p>
            </div>

            <div class="space-y-1 mb-3">
              <div v-for="item in order.items" :key="item.id" class="text-sm text-gray-700 dark:text-gray-200 flex justify-between">
                <span><b class="text-blue-600">x{{ item.quantity }}</b> {{ item.productName }}</span>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t dark:border-gray-600 flex gap-2">
               <button
                  v-if="order.status === ORDER_STATUS.PENDING_PAYMENT"
                  @click="handleConfirmPayment(order)"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded font-semibold text-sm transition-colors"
               >
                 💰 Đã nhận tiền
               </button>

               <button
                  v-else
                  @click="handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded font-semibold text-sm transition-colors"
               >
                 👨‍🍳 Bếp nhận đơn
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 flex justify-between items-center">
          <h2 class="font-bold text-yellow-800 dark:text-yellow-200 uppercase">2. Đang Làm</h2>
          <span class="bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ preparingOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <div v-for="order in preparingOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <span class="text-lg font-bold text-gray-800 dark:text-white">#{{ order.orderCode.slice(-4) }}</span>
              <span class="text-xs font-bold bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Bàn ' + (order.tableName || '?') : 'Shipper' }}
              </span>
            </div>

            <div class="bg-gray-50 dark:bg-gray-600/50 p-2 rounded mb-3 space-y-2">
               <div v-for="item in order.items" :key="item.id" class="text-sm border-b border-dashed border-gray-300 dark:border-gray-500 last:border-0 pb-1 last:pb-0">
                  <div class="font-bold text-gray-800 dark:text-white">
                    <span class="text-yellow-600 text-lg mr-1">{{ item.quantity }}</span>
                    {{ item.productName }} <span class="text-xs font-normal text-gray-500">({{ item.sizeLabel }})</span>
                  </div>
                  <div class="pl-4 text-xs text-gray-500 space-y-0.5">
                    <p v-if="item.sugarLevel || item.iceLevel">
                       {{ item.sugarLevel ? `Đường ${item.sugarLevel}` : '' }}
                       {{ item.iceLevel ? ` - Đá ${item.iceLevel}` : '' }}
                    </p>
                    <p v-if="item.note" class="text-red-500 font-bold italic">Note: {{ item.note }}</p>
                  </div>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
               <button
                  v-if="order.status === ORDER_STATUS.CONFIRMED"
                  @click="handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)"
                  class="col-span-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded font-semibold text-sm"
               >
                 🔥 Bắt đầu làm
               </button>
               <button
                  v-else
                  @click="handleUpdateStatus(order.id, order.orderType === ORDER_TYPE.AT_COUNTER ? ORDER_STATUS.RECEIVED : ORDER_STATUS.DELIVERING)"
                  class="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold text-sm flex justify-center items-center gap-2"
               >
                 <span>✅</span> Xong món
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
        <div class="p-3 bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 flex justify-between items-center">
          <h2 class="font-bold text-green-800 dark:text-green-200 uppercase">3. Trả Hàng</h2>
          <span class="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ outgoingOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <div v-for="order in outgoingOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center mb-2">
              <span class="text-lg font-bold text-gray-800 dark:text-white">#{{ order.orderCode.slice(-4) }}</span>
              <span class="text-green-600 font-bold text-sm">{{ formatPrice(order.grandTotal) }}</span>
            </div>

            <div class="text-sm text-gray-600 dark:text-gray-300 mb-3 bg-green-50 dark:bg-green-900/20 p-2 rounded">
               <p class="font-bold mb-1">
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Khách tại quán' : 'Shipper: ' + (order.shipperName || 'Chưa gán') }}
              </p>
              <p v-if="!order.isPaid" class="text-red-500 font-bold flex items-center gap-1">
                ⚠️ Chưa trả tiền
              </p>
              <p v-else class="text-green-600 font-bold flex items-center gap-1">✅ Đã thanh toán</p>
            </div>

            <button @click="handleComplete(order)" class="w-full bg-gray-800 hover:bg-black text-white py-2 rounded font-bold text-sm shadow-sm">
              Hoàn tất đơn hàng
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
</style>
