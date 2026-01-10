<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useAdminStore } from '@/stores/admin'
import { formatDate } from '@/utils/formatters'
import {  ORDER_STATUS_UI } from '@/constants/order.constants'
import { USER_ROLE } from '@/constants/user.constants'
import { useToastStore } from '@/stores/toast'

import OrderCancelModal from '@/components/common/order/OrderCancelModal.vue'
import OrderDetailItems from '@/components/common/order/OrderDetailItems.vue'
import OrderSummaryCard from '@/components/common/order/OrderSummaryCard.vue'
import OrderContactInfo from '@/components/common/order/OrderContactInfo.vue'
import AdminOrderActions from '@/components/admin/sales/order/AdminOrderActions.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const { currentOrder: order, loading } = storeToRefs(orderStore)
const { shippers } = storeToRefs(adminStore)

// --- COMPUTED ---
const shipperOptions = computed(() => {
  if (!shippers.value) return []
  const allowedRoles = [USER_ROLE.STAFF, USER_ROLE.MANAGER, USER_ROLE.ADMIN]
  return shippers.value.filter((u) => allowedRoles.includes(u.role))
})

const currentStatusConfig = computed(() => {
  if (!order.value) return {}
  return ORDER_STATUS_UI[order.value.status] || {}
})

// --- ACTIONS ---

const fetchData = async () => {
  const code = route.params.code
  if (code) {
    await Promise.all([orderStore.fetchOrderDetail(code), adminStore.fetchAllUsers()])
  }
}

const updateStatus = async (newStatus) => {
  if (!confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng?')) return
  try {
    await orderStore.updateStatusAction(order.value.id, newStatus)
    // fetchData() // Không cần gọi lại nếu store đã tự cập nhật local state
  } catch (e) {
    toastStore.show({ message: e.message || 'Lỗi cập nhật', type: 'error' })
  }
}

// 🟢 [FIX 2] Nhận shipperId từ sự kiện của con, không dùng state cục bộ
const assignShipper = async (shipperId) => {
  if (!shipperId) return

  try {
    await orderStore.assignShipperAction(order.value.id, shipperId)
    toastStore.show({ message: 'Đã gán shipper thành công!', type: 'success' })
    fetchData() // Reload để cập nhật tên shipper trên giao diện
  } catch (e) {
    toastStore.show({ message: e.message || 'Có lỗi xảy ra khi gán shipper', type: 'error' })
  }
}

// --- XỬ LÝ HỦY ĐƠN ---
const isCancelModalOpen = ref(false)
const isCancelling = ref(false)

// 🟢 [FIX 1] Định nghĩa hàm mở modal để template gọi
const openCancelModal = () => {
  isCancelModalOpen.value = true
}

const handleCancelOrder = async ({ reason, note }) => {
  isCancelling.value = true
  try {
    await orderStore.cancelOrderAction(order.value.id, { reason, note })
    toastStore.show({ message: 'Đã hủy đơn hàng thành công!', type: 'success' })
    isCancelModalOpen.value = false
    fetchData()
  } catch (e) {
    toastStore.show({ message: e.message || 'Lỗi hủy đơn', type: 'error' })
  } finally {
    isCancelling.value = false
  }
}

// --- XỬ LÝ THANH TOÁN ---
const handleManualConfirmPayment = async () => {
  if (!confirm('Xác nhận đã nhận được tiền chuyển khoản từ khách?')) return

  const success = await orderStore.confirmPaymentAction(order.value.id)
  if (success) {
    toastStore.show({ type: 'success', message: 'Đã cập nhật trạng thái thanh toán!' })
    await fetchData()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div v-if="loading && !order" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="order" class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 text-gray-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Đơn hàng #{{ order.orderCode }}
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1',
                  currentStatusConfig.color,
                ]"
              >
                <svg
                  v-if="currentStatusConfig.iconPath"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path fill-rule="evenodd" clip-rule="evenodd" :d="currentStatusConfig.iconPath" />
                </svg>
                {{ currentStatusConfig.label }}
              </span>
            </h1>
            <p class="text-sm text-gray-500 mt-1">Đặt lúc: {{ formatDate(order.createdAt) }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
              />
            </svg>
            In hóa đơn
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <OrderDetailItems :items="order.items" />

          <OrderSummaryCard :order="order"> </OrderSummaryCard>
        </div>

        <div class="lg:col-span-1 space-y-6">
          <AdminOrderActions
            :order="order"
            :shipper-options="shipperOptions"
            :is-processing="loading"
            @update-status="updateStatus"
            @assign-shipper="assignShipper"
            @cancel="openCancelModal"
            @confirm-payment="handleManualConfirmPayment"
          />
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Thông tin khách hàng</h3>
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.recipientName || order.userName }}
                </p>
                <p class="text-sm text-gray-500">{{ order.recipientPhone }}</p>
                <p
                  v-if="order.userId"
                  class="text-xs text-blue-500 mt-1 cursor-pointer hover:underline"
                >
                  Xem hồ sơ khách hàng
                </p>
              </div>
            </div>
          </div>

          <OrderContactInfo :order="order" :show-shipper="true" />
        </div>
      </div>
    </div>

    <OrderCancelModal
      :show="isCancelModalOpen"
      :is-loading="isCancelling"
      user-role="Admin"
      :order-code="order?.orderCode"
      @close="isCancelModalOpen = false"
      @submit="handleCancelOrder"
    />
  </div>
</template>
