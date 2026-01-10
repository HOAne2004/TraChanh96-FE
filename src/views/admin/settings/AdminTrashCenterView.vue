<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { formatDate, formatPrice } from '@/utils/formatters'
import { ORDER_STATUS_UI } from '@/constants/order.constants'

// 🛠️ THAY THẾ: Dùng AdminDataTable thay vì OrderTable cũ
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

const orderStore = useOrderStore()
const { orders, loading: orderLoading } = storeToRefs(orderStore)

// State quản lý Tab
const activeTab = ref('orders')

const tabs = [
  { id: 'orders', label: 'Đơn hàng', icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
  // Các tab khác...
]

// --- CẤU HÌNH CỘT CHO BẢNG RÁC ---
const orderColumns = [
  { key: 'orderCode', label: 'Mã đơn', cellClass: 'font-medium text-gray-500' },
  { key: 'recipientName', label: 'Khách hàng' },
  { key: 'deletedAt', label: 'Ngày xóa', cellClass: 'text-red-500 text-sm' }, // Thêm cột ngày xóa
  { key: 'grandTotal', label: 'Tổng tiền', headerClass: 'text-right', cellClass: 'text-right' },
  { key: 'status', label: 'Trạng thái gốc', headerClass: 'text-center', cellClass: 'text-center' },
]

const getStatusConfig = (statusEnum) => ORDER_STATUS_UI[statusEnum] || {}

// --- ACTIONS ---

const fetchData = async () => {
  if (activeTab.value === 'orders') {
    // Gọi API lấy list đã xóa (IsDeleted = true)
    await orderStore.fetchOrders({ isDeleted: true, pageSize: 100 })
  }
}

// Xử lý khôi phục
const onRestoreOrder = async (id) => {
  if (confirm('Khôi phục đơn hàng này?')) {
    await orderStore.restoreOrderAction(id)
    // Store sẽ tự update list, không cần fetch lại
  }
}

// Watch tab change
watch(activeTab, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-3 bg-red-100 rounded-full text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Thùng rác hệ thống</h1>
        <p class="text-sm text-gray-500">Các dữ liệu đã xóa sẽ được lưu ở đây trong 30 ngày.</p>
      </div>
    </div>

    <div class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
          activeTab === tab.id ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
        </svg>
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">

      <div v-if="activeTab === 'orders'">
        <AdminDataTable
          :items="orders"
          :columns="orderColumns"
          :loading="orderLoading"
          :pagination="null"
        >
          <template #cell-orderCode="{ item }">
            #{{ item.orderCode || item.id }}
          </template>

          <template #cell-recipientName="{ item }">
            <div class="flex flex-col">
              <span>{{ item.recipientName || item.userName }}</span>
              <span class="text-xs text-gray-400">{{ item.recipientPhone }}</span>
            </div>
          </template>

          <template #cell-deletedAt="{ item }">
            {{ formatDate(item.deletedAt || item.updatedAt) }}
          </template>

          <template #cell-grandTotal="{ value }">
            {{ formatPrice(value) }} đ
          </template>

          <template #cell-status="{ value }">
            <span :class="['px-2 py-0.5 rounded text-xs border opacity-70', getStatusConfig(value).color]">
              {{ getStatusConfig(value).label }}
            </span>
          </template>

          <template #action="{ item }">
            <button
              @click="onRestoreOrder(item.id)"
              class="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors border border-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Khôi phục
            </button>
          </template>

        </AdminDataTable>
      </div>

      <div v-else class="p-12 text-center text-gray-500">
        Tính năng đang phát triển...
      </div>

    </div>
  </div>
</template>
