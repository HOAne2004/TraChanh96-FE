<script setup>
import { onMounted, computed, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/sales/order.store'
import { ORDER_STATUS, ORDER_TYPE } from '@/constants/order.constants'
import { formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/system/toast.store'
import { useModalStore } from '@/stores/system/modal.store'

const orderStore = useOrderStore()
const toastStore = useToastStore()
const modalStore = useModalStore()
const { orders: allOrders } = storeToRefs(orderStore)

const REFRESH_INTERVAL = 15000
let refreshTimer = null

// --- 1. Cột Đơn Mới (Bao gồm cả Chờ thanh toán) ---
const newOrders = computed(() => {
  return (allOrders.value || [])
    .filter(
      (o) => o.status === ORDER_STATUS.NEW || o.status === ORDER_STATUS.PENDING_PAYMENT, // Hiển thị cả đơn chờ CK để Staff check
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
})

// --- 2. Cột Đang Chế Biến ---
const preparingOrders = computed(() => {
  return (allOrders.value || [])
    .filter((o) => o.status === ORDER_STATUS.CONFIRMED || o.status === ORDER_STATUS.PREPARING)
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
})

// --- 3. Cột Chờ Trả Hàng (Sẵn sàng) ---
const outgoingOrders = computed(() => {
  return (allOrders.value || [])
    .filter((o) => o.status === ORDER_STATUS.READY)
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
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
  const isConfirmed = await modalStore.confirmAction(
    `Xác nhận đã nhận khoản tiền ${formatPrice(order.grandTotal)} cho đơn #${order.orderCode}?`,
    'Xác nhận thanh toán',
  )
  if (!isConfirmed) return

  try {
    const res = await orderStore.confirmPaymentAction(order.id)
    if (res) {
      toastStore.show({ type: 'success', message: 'Xác nhận thanh toán thành công!' })
      if (order.status === ORDER_STATUS.PENDING_PAYMENT) {
        await orderStore.updateStatusAction(order.id, ORDER_STATUS.CONFIRMED)
      }
      fetchOrders()
    }
  } catch {
    // lỗi sẽ được hiển thị ở store
  }
}

const showPickupModal = ref(false)
const pickupCodeInput = ref('')
const currentPickupOrder = ref(null)

const openPickupModal = (order) => {
  currentPickupOrder.value = order
  pickupCodeInput.value = ''
  showPickupModal.value = true
}

const closePickupModal = () => {
  showPickupModal.value = false
  currentPickupOrder.value = null
}

const submitPickupCode = async () => {
  const order = currentPickupOrder.value
  const code = pickupCodeInput.value.trim()

  if (code) {
      try {
        await orderStore.verifyPickupAction(order.id, code)
        toastStore.show({ type: 'success', message: 'Xác thực mã lấy đồ thành công!' })
        fetchOrders()
        closePickupModal()
      } catch (e) {
        toastStore.show({ type: 'error', message: e.message || 'Mã xác thực không đúng' })
      }
  } else {
      closePickupModal()
      const isConfirmed = await modalStore.confirmAction(`Xác nhận khách đã lấy đơn Pickup #${order.orderCode}?`, 'Xác nhận')
      if (!isConfirmed) return
      handleUpdateStatus(order.id, ORDER_STATUS.RECEIVED)
  }
}

const handleComplete = async (order) => {
  const isPickup = order.orderType === 'pickup' || order.orderType === ORDER_TYPE.PICKUP
  const isAtCounter = order.orderType === 'at_counter' || order.orderType === ORDER_TYPE.AT_COUNTER

  if (isPickup) {
    openPickupModal(order)
    return
  }

  if (isAtCounter) {
    const isConfirmed = await modalStore.confirmAction(`Xác nhận khách tại quán đã lấy đơn #${order.orderCode}?`, 'Xác nhận giao hàng')
    if (!isConfirmed) return
    handleUpdateStatus(order.id, ORDER_STATUS.RECEIVED)
  } else {
    const isConfirmed = await modalStore.confirmAction(`Xác nhận giao đơn #${order.orderCode} cho Shipper?`, 'Xác nhận giao hàng')
    if (!isConfirmed) return
    handleUpdateStatus(order.id, ORDER_STATUS.DELIVERING)
  }
}

// --- HELPER ---
const getTimeElapsed = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  return minutes < 60 ? `${minutes}p trước` : `${Math.floor(minutes / 60)}h trước`
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
  <div class="h-[calc(100vh-64px)] bg-gray-100/50 dark:bg-gray-900 p-4 overflow-hidden flex flex-col">
    <!-- Header Page -->
    <div class="flex justify-between items-center mb-6 shrink-0">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center border border-gray-200/60 dark:border-gray-700 text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <span class="tracking-tight">Bếp & Pha Chế</span>
        
        <div class="flex items-center gap-2 ml-4">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span class="text-sm text-green-600 dark:text-green-400 font-black uppercase tracking-widest">
            Realtime
          </span>
        </div>

        <span class="ml-2 text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700">
          Tổng: {{ newOrders.length + preparingOrders.length + outgoingOrders.length }} đơn
        </span>
      </h1>
      
      <button
        @click="fetchOrders"
        class="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl border border-gray-200/60 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center gap-2 transition-all active:scale-95 font-bold hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
        <span>Làm mới</span>
      </button>
    </div>

    <!-- Board Content -->
    <div class="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_1.2fr_1fr] gap-5 overflow-hidden min-h-0">
      
      <!-- Cột 1: Tiếp Nhận -->
      <div class="flex flex-col rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] min-h-0">
        <div class="px-5 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-between shadow-sm z-10">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/70 font-bold mb-0.5">Workflow</p>
            <h2 class="text-lg font-black tracking-wide leading-none">1. Tiếp Nhận</h2>
          </div>
          <span class="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-extrabold border border-white/20 shadow-inner">
            {{ newOrders.length }}
          </span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/20">
          <div
            v-for="order in newOrders"
            :key="order.id"
            :class="[
              'group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-gradient-to-b before:from-blue-400 before:to-cyan-500',
              Date.now() - new Date(order.createdAt).getTime() < 30000 ? 'ring-2 ring-blue-400/40 animate-[pulse_3s_ease-in-out_infinite]' : ''
            ]"
          >
            <div class="absolute top-4 right-4 flex flex-col items-end gap-1.5">
              <span
                v-if="order.orderType === ORDER_TYPE.AT_COUNTER"
                class="bg-purple-50/80 border border-purple-200 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide"
              >
                Tại quán
              </span>
              <span
                v-else
                class="bg-orange-50/80 border border-orange-200 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide"
              >
                Giao đi
              </span>

              <span
                v-if="order.status === ORDER_STATUS.PENDING_PAYMENT"
                class="bg-red-50/90 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-200 animate-pulse tracking-wide"
              >
                Chờ CK
              </span>
            </div>

            <div class="flex items-center gap-3 mb-4 mt-1">
              <div class="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              </div>
              <div>
                <p class="text-xl font-black tracking-wide text-gray-900 dark:text-white leading-none mb-1.5">
                  #{{ order.orderCode ? order.orderCode.slice(-4) : '...' }}
                </p>
                <p class="text-xs text-gray-500 font-semibold tracking-wide">
                  {{ getTimeElapsed(order.createdAt) }}
                </p>
              </div>
            </div>

            <div class="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100/80 dark:border-gray-700/80 p-3.5 mb-4 shadow-sm">
              <div v-for="item in order.items" :key="item.id" class="text-sm text-gray-700 dark:text-gray-200 flex flex-col gap-1 pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                <div class="flex items-start gap-2.5">
                  <span class="min-w-[28px] h-7 px-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-black flex items-center justify-center shadow-sm border border-blue-400">x{{ item.quantity }}</span>
                  <span class="font-bold mt-1 text-gray-800 dark:text-gray-100">{{ item.productName }}</span>
                </div>
              </div>
            </div>

            <div class="pt-1 flex gap-2.5">
              <button
                v-if="order.status === ORDER_STATUS.PENDING_PAYMENT"
                @click="handleConfirmPayment(order)"
                class="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Đã nhận tiền
              </button>
              <button
                v-else
                @click="handleUpdateStatus(order.id, ORDER_STATUS.CONFIRMED)"
                class="flex-1 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Nhận đơn
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột 2: Đang Làm -->
      <div class="flex flex-col rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] min-h-0">
        <div class="px-5 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center justify-between shadow-sm z-10">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/70 font-bold mb-0.5">Workflow</p>
            <h2 class="text-lg font-black tracking-wide leading-none">2. Đang Làm</h2>
          </div>
          <span class="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-extrabold border border-white/20 shadow-inner">
            {{ preparingOrders.length }}
          </span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/20">
          <div
            v-for="order in preparingOrders"
            :key="order.id"
            class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-gradient-to-b before:from-amber-400 before:to-orange-500"
          >
            <div class="flex justify-between items-start mb-4 mt-1">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>
                </div>
                <div>
                  <p class="text-xl font-black tracking-wide text-gray-900 dark:text-white leading-none mb-1.5">
                    #{{ order.orderCode.slice(-4) }}
                  </p>
                  <p class="text-xs text-gray-500 font-semibold tracking-wide">{{ getTimeElapsed(order.updatedAt) }}</p>
                </div>
              </div>
              
              <span class="text-[10px] font-black bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-600 uppercase flex items-center gap-1 shadow-sm mt-1 tracking-wide">
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Bàn ' + (order.tableName || '?') : 'Shipper' }}
              </span>
            </div>

            <div class="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100/80 dark:border-gray-700/80 p-3.5 mb-4 shadow-sm">
              <div v-for="item in order.items" :key="item.id" class="text-sm border-b border-dashed border-gray-200 dark:border-gray-600 last:border-0 pb-3 last:pb-0 mb-3 last:mb-0">
                <div class="font-bold text-gray-800 dark:text-white flex items-start gap-2.5">
                  <span class="min-w-[28px] h-7 px-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-black flex items-center justify-center shadow-sm border border-orange-400">x{{ item.quantity }}</span>
                  <span class="mt-1 leading-snug">
                    {{ item.productName }}
                    <span class="text-[11px] font-semibold text-gray-500 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 ml-1.5 align-middle shadow-sm">Bản {{ item.sizeLabel }}</span>
                  </span>
                </div>
                <div class="pl-[38px] mt-2 space-y-1.5">
                  <div v-if="item.sugarLevel || item.iceLevel" class="flex flex-wrap gap-2">
                    <span v-if="item.sugarLevel" class="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Đường {{ item.sugarLevel }}
                    </span>
                    <span v-if="item.iceLevel" class="text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>Đá {{ item.iceLevel }}
                    </span>
                  </div>
                  <p v-if="item.note" class="text-xs text-red-700 bg-red-50/80 p-2 rounded-lg border border-red-100 flex items-start gap-1.5 shadow-inner mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                    <span class="italic font-bold tracking-tight">{{ item.note }}</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-1 flex gap-2.5">
              <button
                v-if="order.status === ORDER_STATUS.CONFIRMED"
                @click="handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)"
                class="flex-1 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Bắt đầu làm
              </button>
              <button
                v-else
                @click="handleUpdateStatus(order.id, ORDER_STATUS.READY)"
                class="flex-1 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Xong món
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột 3: Trả Hàng -->
      <div class="flex flex-col rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] min-h-0">
        <div class="px-5 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-between shadow-sm z-10">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/70 font-bold mb-0.5">Workflow</p>
            <h2 class="text-lg font-black tracking-wide leading-none">3. Trả Hàng</h2>
          </div>
          <span class="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-extrabold border border-white/20 shadow-inner">
            {{ outgoingOrders.length }}
          </span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/20">
          <div
            v-for="order in outgoingOrders"
            :key="order.id"
            class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 p-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-gradient-to-b before:from-emerald-400 before:to-green-500"
          >
            <div class="flex justify-between items-center mb-4 mt-1">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                </div>
                <div>
                  <p class="text-xl font-black tracking-wide text-gray-900 dark:text-white leading-none mb-1.5">
                    #{{ order.orderCode.slice(-4) }}
                  </p>
                  <p class="text-xs text-gray-500 font-semibold tracking-wide">{{ getTimeElapsed(order.updatedAt) }}</p>
                </div>
              </div>
              <span class="text-green-700 font-black text-[13px] bg-green-50 px-3 py-1.5 rounded-xl border border-green-200/60 shadow-sm tracking-wide">
                {{ formatPrice(order.grandTotal) }}
              </span>
            </div>

            <div class="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100/80 dark:border-gray-700/80 p-3.5 mb-4 shadow-sm">
              <p class="font-bold mb-2.5 flex items-center gap-2 text-gray-800 dark:text-gray-100 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span class="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  <svg v-if="order.orderType === ORDER_TYPE.AT_COUNTER" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-purple-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h.05a2.5 2.5 0 004.9 0H17a1 1 0 001-1v-2.828a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0014.586 7H14z"/></svg>
                </span>
                {{ order.orderType === ORDER_TYPE.AT_COUNTER ? 'Khách tại quán' : 'Shipper: ' + (order.shipperName || 'Chưa gán') }}
              </p>
              
              <p v-if="!order.isPaid" class="text-red-600 font-bold flex items-center gap-2 mt-3 bg-red-50/50 p-2 rounded-lg">
                <span class="flex h-2.5 w-2.5 relative ml-1">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span class="tracking-wide text-sm">Chưa thanh toán</span>
              </p>
              <p v-else class="text-green-600 font-bold flex items-center gap-2 mt-3 bg-green-50/50 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-0.5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="tracking-wide text-sm">Đã thanh toán</span>
              </p>
            </div>

            <div class="pt-1 space-y-2.5">
              <button
                v-if="!order.isPaid"
                @click="handleConfirmPayment(order)"
                class="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                Xác nhận đã thu tiền
              </button>

              <button
                @click="handleComplete(order)"
                class="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span v-if="order.orderType === 'delivery' || order.orderType === ORDER_TYPE.DELIVERY">Giao cho Shipper</span>
                <span v-else>Khách lấy đồ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pickup Code Modal -->
    <div v-if="showPickupModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-7 border border-white/20 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
        <h3 class="text-2xl font-black text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          Xác nhận lấy đồ
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Nhập mã xác thực của khách hàng (hoặc để trống nếu đã xác thực).</p>
        <input v-model="pickupCodeInput" type="text" placeholder="Mã lấy đồ..." class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none mb-8 dark:text-white font-bold text-lg text-center transition-all shadow-inner" />
        <div class="flex justify-end gap-3">
          <button @click="closePickupModal" class="px-6 py-3 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold">
            Hủy
          </button>
          <button @click="submitPickupCode" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white transition-all font-bold shadow-lg shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.35);
  border-radius: 999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.55);
}
</style>
