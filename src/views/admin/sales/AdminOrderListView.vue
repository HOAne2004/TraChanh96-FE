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
import OrderTable from '@/components/admin/sales/OrderTable.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'

const router = useRouter()
const orderStore = useOrderStore()
const { orders, pagination, loading } = storeToRefs(orderStore)
const toastStore = useToastStore()
// Options trạng thái cho FilterBar
const statusOptions = getStatusOptions()

// Lưu trạng thái filter hiện tại để dùng cho phân trang
const currentFilters = ref({})

// --- ACTIONS ---

const prepareApiParams = (filterParams = {}, page = 1) => {
  const params = {
    pageIndex: page,
    pageSize: 10,
    ...filterParams
  }

  // Loại bỏ giá trị rỗng
  Object.keys(params).forEach(key => {
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

// --- ACTIONS ---
const fetchOrders = async (filterParams = {}, page = 1) => {
  currentFilters.value = filterParams

  const apiParams = prepareApiParams(filterParams, page)

  try {
    await orderStore.fetchOrders(apiParams)
  } catch (err) {
    console.error("Lỗi tải đơn hàng:", err)
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

    <OrderTable :orders="orders" :loading="loading" @view-detail="goToDetail" />
    <AdminPagination :pagination="pagination" @page-change="onPageChange" />
  </div>
</template>
