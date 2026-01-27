<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAdminStore } from '@/stores/admin'
import { useProductStore } from '@/stores/product'
import { formatPrice, formatCurrencyCompact, formatDate } from '@/utils/formatters' // Thêm formatDate

// Constants
import { ORDER_STATUS, ORDER_STATUS_UI } from '@/constants/order.constants'
import { USER_ROLE } from '@/constants/user.constants'

// Components
import StatCard from '@/components/admin/dashboard/StatCard.vue'
import RevenueChart from '@/components/admin/dashboard/RevenueChart.vue'
import TopProductsChart from '@/components/admin/dashboard/TopProductsChart.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue' // 👈 Dùng bảng Generic

const router = useRouter()
const orderStore = useOrderStore()
const adminStore = useAdminStore()
const productStore = useProductStore()

const { orders: allOrders, loading: ordersLoading, stats } = storeToRefs(orderStore)
const { users: allUsers, loading: usersLoading } = storeToRefs(adminStore)
const { products } = storeToRefs(productStore)

const statsLoading = computed(() => ordersLoading.value || usersLoading.value)

// --- TÍNH TOÁN KPI ---
// (Giữ nguyên logic tính toán của bạn)
const totalRevenue = computed(() => stats.value?.totalRevenueAllTime || 0)

const totalOrdersCount = computed(() => {
  return stats.value?.totalCompletedOrders || 0
})

const customerCount = computed(() => {
  const listUsers = allUsers.value || []
  if (usersLoading.value) return 0
  return listUsers.filter((user) => user.role === USER_ROLE.CUSTOMER).length
})

// --- DATA TABLE CONFIG ---

// 1. Dữ liệu cho bảng (5 đơn mới nhất)
const latestOrders = computed(() => {
  const list = allOrders.value || []
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
})

// 2. Cấu hình cột cho Dashboard (Gọn gàng hơn trang list full)
const dashboardColumns = [
  { key: 'orderCode', label: 'Mã đơn', cellClass: 'font-medium text-green-600' },
  { key: 'recipientName', label: 'Khách hàng' },
  { key: 'createdAt', label: 'Thời gian', cellClass: 'text-gray-500 text-xs' },
  {
    key: 'grandTotal',
    label: 'Tổng tiền',
    cellClass: 'font-bold text-right',
    headerClass: 'text-right',
  },
  { key: 'status', label: 'Trạng thái', cellClass: 'text-center', headerClass: 'text-center' },
]

// 3. Helper lấy config UI status
const getStatusConfig = (statusEnum) => ORDER_STATUS_UI[statusEnum] || {}

// --- SẢN PHẨM BÁN CHẠY ---
const bestSellingProducts = computed(() => {
  return [...products.value].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5)
})

const handleViewDetail = (idOrCode) => {
  router.push({ name: 'admin.orders.detail', params: { code: idOrCode } })
}

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    orderStore.fetchStats(),
    adminStore.fetchAllUsers(),
    productStore.fetchProducts(),
  ])
})
</script>

<template>
  <main class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Tổng quan Quản trị</h1>

    <div
      v-if="statsLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse"
    >
      <div v-for="i in 4" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div :title="'Chi tiết: ' + formatPrice(totalRevenue) + ' VND'">
        <StatCard
          title="Tổng Doanh thu"
          :value="formatCurrencyCompact(totalRevenue) + ' VND'"
          subtitle="Trên toàn hệ thống"
          icon-path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          color="green"
        />
      </div>
      <StatCard
        title="Đơn hàng"
        :value="totalOrdersCount"
        subtitle="Đã bán"
        icon-path="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        color="yellow"
      />
      <StatCard
        title="Tổng Khách hàng"
        :value="customerCount"
        subtitle="Tài khoản đã đăng ký"
        icon-path="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        color="blue"
      />
      <StatCard
        title="Tổng Sản phẩm"
        :value="products.length"
        subtitle="Đang bán trên hệ thống"
        icon-path="M6.5 8 C9 6.5,15 6.5,17.5 8 M6.5 8 C8 3,16 3,17.5 8 V10 C16 9.3,8 9.3,6.5 10 Z M7 10 L8 20 C9.5 21.5,14.5 21.5,16 20 L17 10 Z M8 14 C9.5 13,14.5 13.5,16 12.5 M8 20 C9.5 21,14.5 21,16 20"
        color="red"
      />
    </div>

    <div class="grid grid-cols-1 mt-6 lg:grid-cols-3 gap-6 mb-8">
      <div
        class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Doanh thu 7 ngày gần nhất
        </h2>
        <RevenueChart :orders="allOrders" :is-loading="ordersLoading" />
      </div>
      <div
        class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top 5 Món bán chạy</h2>
        <TopProductsChart :products="bestSellingProducts" />
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div
        class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"
      >
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Đơn hàng mới nhất</h2>
        <button
          @click="router.push('/admin/orders')"
          class="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Xem tất cả &rarr;
        </button>
      </div>

      <AdminDataTable
        :items="latestOrders"
        :columns="dashboardColumns"
        :loading="ordersLoading"
        :pagination="null"
      >
        <template #cell-orderCode="{ item }"> #{{ item.orderCode || item.id }} </template>

        <template #cell-recipientName="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-white">{{
              item.recipientName || item.userName || 'Khách lẻ'
            }}</span>
            <span class="text-xs text-gray-500">{{ item.recipientPhone }}</span>
          </div>
        </template>

        <template #cell-createdAt="{ value }">
          {{ formatDate(value) }}
        </template>

        <template #cell-grandTotal="{ value }"> {{ formatPrice(value) }} đ </template>

        <template #cell-status="{ value }">
          <span
            :class="[
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
              getStatusConfig(value).color,
            ]"
          >
            {{ getStatusConfig(value).label }}
          </span>
        </template>

        <template #action="{ item }">
          <button
            @click="handleViewDetail(item.orderCode || item.id)"
            class="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
          >
            Chi tiết
          </button>
        </template>
      </AdminDataTable>
    </div>
  </main>
</template>
