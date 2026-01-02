<script setup>
import { formatDate, formatPrice } from '@/utils/formatters'
import { ORDER_STATUS_UI } from '@/constants/order.constants' // Import constant

const props = defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  isTrash: { type: Boolean, default: false },
})

const emit = defineEmits(['view-detail', 'update-status', 'delete', 'restore'])

// Helper lấy Config UI từ Constant
const getStatusConfig = (statusEnum) => {
  // statusEnum trả về từ BE là số (ví dụ: 1), map vào object
  return (
    ORDER_STATUS_UI[statusEnum] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800' }
  )
}
const getOrderTypeColor = (typeEnum) => {
  return ORDER_TYPE_UI[typeEnum]?.color || 'bg-gray-100 text-gray-800'
}

</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <div v-if="loading" class="p-12 flex justify-center">
      <svg
        class="animate-spin h-8 w-8 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div v-else-if="!orders || orders.length === 0" class="p-12 text-center text-gray-500">
      Không tìm thấy dữ liệu.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700"
          >
            <th class="px-6 py-4 whitespace-nowrap">Mã đơn</th>
            <th class="px-6 py-4 whitespace-nowrap">Khách hàng</th>
            <th class="px-6 py-4 whitespace-nowrap">Ngày đặt</th>
            <th class="px-6 py-4 text-center whitespace-nowrap">Loại</th>
            <th class="px-6 py-4 text-right whitespace-nowrap">Tổng tiền</th>
            <th class="px-6 py-4 text-center whitespace-nowrap">Trạng thái</th>
            <th class="px-6 py-4 text-center whitespace-nowrap">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <tr
            v-for="order in orders"
            :key="order.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white select-text">
              #{{ order.orderCode || order.id }}
            </td>

            <td class="px-6 py-4 select-text">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ order.recipientName || order.userName || 'Khách vãng lai' }}
                </span>
                <span class="text-xs text-gray-500 select-all">
                  {{ order.recipientPhone || order.shipperPhone || '' }}
                </span>
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-500 select-text">
              {{ formatDate(order.createdAt) }}
            </td>

            <td class="px-6 py-4 text-center">
              <span
                v-if="order.isAtCounter || order.orderType === 'AtCounter'"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                Tại quầy
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"
              >
                Giao hàng
              </span>
            </td>

            <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white select-text">
              {{ formatPrice(order.grandTotal) }} đ
            </td>

            <td class="px-6 py-4 text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                  getStatusConfig(order.status).color,
                ]"
              >
                {{ getStatusConfig(order.status).label }}
              </span>
            </td>

            <td class="px-6 py-4 text-center">
              <button
                @click.stop="$emit('view-detail', order.orderCode || order.id)"
                class="text-green-600 hover:text-green-800 font-medium text-sm hover:underline cursor-pointer"
              >
                Xem chi tiết
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
