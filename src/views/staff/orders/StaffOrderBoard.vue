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

// --- 3. Cột Chờ Trả Hàng (Sẵn sàng) ---
const outgoingOrders = computed(() => {
  return (allOrders.value || []).filter(o =>
    o.status === ORDER_STATUS.READY
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
    if(!confirm(`Xác nhận đã nhận khoản tiền ${formatPrice(order.grandTotal)} cho đơn #${order.orderCode}?`)) return;

    try {
      const res = await orderStore.confirmPaymentAction(order.id);
      if(res) {
          toastStore.show({ type: 'success', message: 'Xác nhận thanh toán thành công!' });
          if (order.status === ORDER_STATUS.PENDING_PAYMENT) {
             await orderStore.updateStatusAction(order.id, ORDER_STATUS.CONFIRMED);
          }
          fetchOrders();
      }
    } catch {
      // lỗi sẽ được hiển thị ở store
    }
}

const handleComplete = async (order) => {
  const isPickup = order.orderType === 'pickup' || order.orderType === ORDER_TYPE.PICKUP;
  const isAtCounter = order.orderType === 'at_counter' || order.orderType === ORDER_TYPE.AT_COUNTER;

  if (isPickup) {
    const code = prompt('Nhập mã lấy đồ của khách hàng (hoặc để trống nếu đã xác thực):');
    if (code) {
      try {
        await orderStore.verifyPickupAction(order.id, code);
        toastStore.show({ type: 'success', message: 'Xác thực mã lấy đồ thành công!' });
        fetchOrders();
      } catch (e) {
        toastStore.show({ type: 'error', message: e.message || 'Mã xác thực không đúng' });
      }
      return;
    } else {
      // Nếu bỏ trống có thể là muốn ép hoàn tất (nếu flow cho phép), ta vẫn tiến hành gọi RECEIVED
      if (!confirm(`Xác nhận khách đã lấy đơn Pickup #${order.orderCode}?`)) return;
      handleUpdateStatus(order.id, ORDER_STATUS.RECEIVED);
      return;
    }
  }

  if (isAtCounter) {
     if (!confirm(`Xác nhận khách tại quán đã lấy đơn #${order.orderCode}?`)) return;
     handleUpdateStatus(order.id, ORDER_STATUS.RECEIVED);
  } else {
     if (!confirm(`Xác nhận giao đơn #${order.orderCode} cho Shipper?`)) return;
     handleUpdateStatus(order.id, ORDER_STATUS.DELIVERING);
  }
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
    <div class="flex justify-between items-center mb-6 shrink-0">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
</svg>

        Bếp & Pha Chế
        <span class="text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full shadow-inner">
           Tổng: {{ newOrders.length + preparingOrders.length + outgoingOrders.length }} đơn
        </span>
      </h1>
      <button @click="fetchOrders" class="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm flex items-center gap-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
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

          <div v-for="order in newOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow relative">
            <div class="absolute top-4 right-4 flex flex-col items-end gap-1.5">
               <span v-if="order.orderType === ORDER_TYPE.AT_COUNTER" class="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" /></svg>
                 Tại quán
               </span>
               <span v-else class="bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h.05a2.5 2.5 0 004.9 0H17a1 1 0 001-1v-2.828a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0014.586 7H14z" /></svg>
                 Giao đi
               </span>

               <span v-if="order.status === ORDER_STATUS.PENDING_PAYMENT" class="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse border border-red-200 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                 Chờ CK
               </span>
            </div>

            <div class="mb-3">
               <span class="text-xl font-bold text-gray-800 dark:text-white block">#{{ order.orderCode ? order.orderCode.slice(-4) : '...' }}</span>
               <span class="text-xs text-gray-500 font-medium">{{ getTimeElapsed(order.createdAt) }}</span>
            </div>

            <div class="space-y-1.5 mb-4 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
              <div v-for="item in order.items" :key="item.id" class="text-sm text-gray-700 dark:text-gray-200 flex justify-between items-start">
                <div class="flex gap-2">
                  <span class="font-bold text-blue-600 w-5">x{{ item.quantity }}</span>
                  <span class="font-medium">{{ item.productName }}</span>
                </div>
              </div>
            </div>

            <div class="pt-2 flex gap-2">
               <button
                  v-if="order.status === ORDER_STATUS.PENDING_PAYMENT"
                  @click="handleConfirmPayment(order)"
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" /></svg>
                 Đã nhận tiền
               </button>

               <button
                  v-else
                  @click="handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                 Nhận đơn
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
          <div v-for="order in preparingOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <span class="text-xl font-bold text-gray-800 dark:text-white">#{{ order.orderCode.slice(-4) }}</span>
              <span class="text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-500 uppercase flex items-center gap-1">
                <svg v-if="order.orderType === ORDER_TYPE.AT_COUNTER" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h.05a2.5 2.5 0 004.9 0H17a1 1 0 001-1v-2.828a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0014.586 7H14z" /></svg>
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Bàn ' + (order.tableName || '?') : 'Shipper' }}
              </span>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 mb-4 space-y-3">
               <div v-for="item in order.items" :key="item.id" class="text-sm border-b border-dashed border-gray-200 dark:border-gray-600 last:border-0 pb-2 last:pb-0">
                  <div class="font-bold text-gray-800 dark:text-white flex items-start gap-2">
                    <span class="text-yellow-600 text-lg leading-none w-5">x{{ item.quantity }}</span>
                    <span>
                      {{ item.productName }}
                      <span class="text-xs font-normal text-gray-500 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border dark:border-gray-600 ml-1">Bản {{ item.sizeLabel }}</span>
                    </span>
                  </div>
                  <div class="pl-7 mt-1.5 space-y-1">
                    <div v-if="item.sugarLevel || item.iceLevel" class="flex gap-2">
                       <span v-if="item.sugarLevel" class="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Đường {{ item.sugarLevel }}</span>
                       <span v-if="item.iceLevel" class="text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-100 px-2 py-0.5 rounded flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>Đá {{ item.iceLevel }}</span>
                    </div>
                    <p v-if="item.note" class="text-xs text-red-600 bg-red-50 p-1.5 rounded border border-red-100 mt-1 flex items-start gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                      <span class="italic font-medium">{{ item.note }}</span>
                    </p>
                  </div>
               </div>
            </div>

            <div class="flex gap-2">
               <button
                  v-if="order.status === ORDER_STATUS.CONFIRMED"
                  @click="handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)"
                  class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>
                 Bắt đầu làm
               </button>
               <button
                  v-else
                  @click="handleUpdateStatus(order.id, ORDER_STATUS.READY)"
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                 Xong món
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
          <div v-for="order in outgoingOrders" :key="order.id" class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center mb-3">
              <span class="text-xl font-bold text-gray-800 dark:text-white">#{{ order.orderCode.slice(-4) }}</span>
              <span class="text-green-600 font-bold text-sm bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">{{ formatPrice(order.grandTotal) }}</span>
            </div>

            <div class="text-sm text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg">
               <p class="font-bold mb-2 flex items-center gap-1.5 text-gray-800 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-600">
                <svg v-if="order.orderType === ORDER_TYPE.AT_COUNTER" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h.05a2.5 2.5 0 004.9 0H17a1 1 0 001-1v-2.828a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0014.586 7H14z" /></svg>
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Khách tại quán' : 'Shipper: ' + (order.shipperName || 'Chưa gán') }}
              </p>
              <p v-if="!order.isPaid" class="text-red-600 font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                Chưa trả tiền
              </p>
              <p v-else class="text-green-600 font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                Đã thanh toán
              </p>
            </div>

            <div class="space-y-2 mt-2">
               <button
                  v-if="!order.isPaid"
                  @click="handleConfirmPayment(order)"
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" /></svg>
                 Xác nhận đã thu tiền
               </button>

               <button @click="handleComplete(order)" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5">
                 <span v-if="order.orderType === 'delivery' || order.orderType === ORDER_TYPE.DELIVERY" class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" /></svg>
                    Giao cho Shipper
                 </span>
                 <span v-else class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    Khách lấy đồ
                 </span>
               </button>
            </div>
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
