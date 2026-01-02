<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ORDER_STATUS_UI } from '@/constants/order.constants' // Đảm bảo file này tồn tại hoặc map tay
import { formatPrice, formatDate } from '@/utils/formatters' // Các hàm format

const props = defineProps({
  orders: { type: Array, default: () => [] },
  isLoading: Boolean
})

const router = useRouter()

// Lấy 5 đơn mới nhất
const latestOrders = computed(() => {
  return props.orders ? props.orders.slice(0, 5) : []
})

const getStatusBadge = (status) => {
  return ORDER_STATUS_UI[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-600' }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50">
          <th class="px-4 py-3 font-medium">Mã đơn</th>
          <th class="px-4 py-3 font-medium">Khách hàng</th>
          <th class="px-4 py-3 font-medium">Tổng tiền</th>
          <th class="px-4 py-3 font-medium">Trạng thái</th>
          <th class="px-4 py-3 font-medium">Thời gian</th>
          <th class="px-4 py-3 text-right">Hành động</th>
        </tr>
      </thead>
      <tbody class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
        <tr v-if="isLoading">
           <td colspan="6" class="px-4 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
        </tr>
        <tr v-else-if="latestOrders.length === 0">
           <td colspan="6" class="px-4 py-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
        </tr>
        <tr v-else v-for="order in latestOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
          <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
            #{{ order.orderCode }}
          </td>
          <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
            <div>{{ order.recipientName }}</div>
            <div class="text-xs text-gray-400">{{ order.recipientPhone }}</div>
          </td>
          <td class="px-4 py-3 font-bold text-gray-800 dark:text-white">
            {{ formatPrice(order.grandTotal) }}
          </td>
          <td class="px-4 py-3">
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold border', getStatusBadge(order.status).color]">
              {{ getStatusBadge(order.status).label }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-500 text-xs">
            {{ formatDate(order.createdAt) }}
          </td>
          <td class="px-4 py-3 text-right">
            <button
              @click="router.push(`/admin/orders/${order.orderCode}`)"
              class="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Chi tiết
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
