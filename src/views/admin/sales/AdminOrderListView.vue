<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { formatDate, formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'
import { getStatusOptions } from '@/constants/order.constants'
// Import Components mới tách
import AdminFilterBar from '@/components/admin/common/AdminFilterBar.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue' // Import Generic Table
import { ORDER_STATUS_UI } from '@/constants/order.constants'

const router = useRouter()
const orderStore = useOrderStore()
const { orders, pagination, loading } = storeToRefs(orderStore)
const toastStore = useToastStore()
// Options trạng thái cho FilterBar
const statusOptions = getStatusOptions()

// Lưu trạng thái filter hiện tại để dùng cho phân trang
const currentFilters = ref({})

// --- ACTIONS ---

const orderColumns = [
  { key: 'orderCode', label: 'Mã đơn', cellClass: 'font-medium select-text' },
  { key: 'customer', label: 'Khách hàng', cellClass: 'select-text' }, // Key ảo để dùng slot
  { key: 'createdAt', label: 'Ngày đặt' },
  { key: 'orderType', label: 'Loại', headerClass: 'text-center', cellClass: 'text-center' },
  {
    key: 'grandTotal',
    label: 'Tổng tiền',
    headerClass: 'text-right',
    cellClass: 'text-right font-bold',
  },
  { key: 'status', label: 'Trạng thái', headerClass: 'text-center', cellClass: 'text-center' },
]

// Helper lấy UI status (như cũ)
const getStatusConfig = (statusEnum) => ORDER_STATUS_UI[statusEnum] || {}
const handleDeleteOrder = async (code) => {
    await orderStore.deleteOrderAction(code)
    toastStore.showToast({
      title: 'Thành công',
      message: 'Xóa đơn hàng thành công',
      type: 'success',
    })
}
const prepareApiParams = (filterParams = {}, page = 1) => {
  const params = {
    pageIndex: page,
    pageSize: 10,
    ...filterParams,
  }

  // Loại bỏ giá trị rỗng
  Object.keys(params).forEach((key) => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })

  // Đặc biệt xử lý status: phải là số hợp lệ
  if (params.status !== undefined) {
    const statusNum = Number(params.status)
    if (!isNaN(statusNum)) {
      params.status = statusNum
    } else {
      delete params.status // Nếu không phải số thì xóa
    }
  }

  console.log('🧹 Cleaned API params:', params)
  return params
}

const fetchOrders = async (filterParams = {}, page = 1) => {
  currentFilters.value = filterParams

  const apiParams = prepareApiParams(filterParams, page)

  try {
    await orderStore.fetchOrders(apiParams)
  } catch (err) {
    console.error('Lỗi tải đơn hàng:', err)
    toastStore.showToast({
      title: 'Lỗi',
      message: 'Lỗi tải đơn hàng',
      type: 'error',
    })
  }
}

const onFilterChange = (newFilters) => {
  console.log('🔍 Filter changed:', newFilters)
  fetchOrders(newFilters, 1)
}

const onPageChange = (newPage) => {
  fetchOrders(currentFilters.value, newPage)
}

const goToDetail = (code) => {
  router.push({ name: 'admin.orders.detail', params: { code } })
}

// ⭐️ FIX LỖI 5: Hàm Xuất Excel (CSV cơ bản)
const exportToExcel = () => {
  if (!orders.value || orders.value.length === 0) {
    toastStore.showToast({
      title: 'Lỗi',
      message: 'Không có dữ liệu để xuất',
      type: 'error',
    })
    return
  }

  // 1. Tạo Header
  const headers = ['Mã đơn', 'Khách hàng', 'SĐT', 'Ngày đặt', 'Loại', 'Tổng tiền', 'Trạng thái']

  // 2. Map dữ liệu
  const rows = orders.value.map((o) => [
    o.orderCode || o.id,
    o.recipientName || o.userName || 'Khách vãng lai',
    o.recipientPhone || '',
    formatDate(o.createdAt),
    o.isAtCounter ? 'Tại quầy' : 'Giao hàng',
    formatPrice(o.grandTotal),
    o.status,
  ])

  // 3. Tạo nội dung CSV (Có xử lý BOM để Excel đọc được tiếng Việt)
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')), // Bọc trong "" để xử lý dấu phẩy trong nội dung
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  // 4. Tải xuống
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  toastStore.showToast({
    title: 'Thành công',
    message: 'Xuất file thành công',
    type: 'success',
  })
}

// --- LIFECYCLE ---
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Đơn hàng</h1>
      <p class="text-sm text-gray-500 mt-1">Xem và xử lý các đơn hàng trong hệ thống</p>
    </div>

    <AdminFilterBar
      placeholder="Tìm mã đơn, tên khách, SĐT..."
      :status-options="statusOptions"
      @change="onFilterChange"
      @export="exportToExcel"
    />

    <AdminDataTable
      :items="orders"
      :columns="orderColumns"
      :loading="loading"
      :total-count="pagination.totalRecords"
      @change-page="onPageChange"
    >
      <template #cell-customer="{ item }">
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-white">
            {{ item.recipientName || item.userName || 'Khách lẻ' }}
          </span>
          <span class="text-xs text-gray-500 select-all">{{ item.recipientPhone }}</span>
        </div>
      </template>

      <template #cell-createdAt="{ value }">
        <span class="text-gray-500 text-sm">{{ formatDate(value) }}</span>
      </template>

      <template #cell-orderType="{ item }">
        <span
          v-if="item.isAtCounter"
          class="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
          >Tại quầy</span
        >
        <span
          v-else
          class="px-2 py-0.5 rounded text-xs bg-orange-50 text-orange-700 border border-orange-100"
          >Giao hàng</span
        >
      </template>

      <template #cell-grandTotal="{ value }"> {{ formatPrice(value) }} đ </template>

      <template #cell-status="{ value }">
        <span
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            getStatusConfig(value).color,
          ]"
        >
          <svg
            v-if="getStatusConfig(value).iconPath"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-3.5 h-3.5"
          >
            <path fill-rule="evenodd" clip-rule="evenodd" :d="getStatusConfig(value).iconPath" />
          </svg>
          {{ getStatusConfig(value).label }}
        </span>
      </template>

      <template #action="{ item }">
        <div class="flex items-center justify-center gap-2">

          <button
            @click="goToDetail(item.orderCode || item.id)"
            class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Xem chi tiết"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            @click="handleDeleteOrder(item.id)"
            class="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Xóa đơn hàng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>

        </div>
      </template>
    </AdminDataTable>
    <AdminPagination :pagination="pagination" @page-change="onPageChange" />
  </div>
</template>
