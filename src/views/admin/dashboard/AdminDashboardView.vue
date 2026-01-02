<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useAdminStore } from '@/stores/admin'
import { useProductStore } from '@/stores/product'
import { formatPrice } from '@/utils/formatters'

// Components
import StatCard from '@/components/admin/dashboard/StatCard.vue'
import RevenueChart from '@/components/admin/dashboard/RevenueChart.vue'
import TopProductsChart from '@/components/admin/dashboard/TopProductsChart.vue'
import OrderTable from '@/components/admin/sales/OrderTable.vue' // 🟢 Dùng lại Table xịn

const router = useRouter()
const orderStore = useOrderStore()
const adminStore = useAdminStore()
const productStore = useProductStore()

const { orders: allOrders, loading: ordersLoading } = storeToRefs(orderStore)
const { users: allUsers, loading: usersLoading } = storeToRefs(adminStore)
const { products } = storeToRefs(productStore)

const statsLoading = computed(() => ordersLoading.value || usersLoading.value)

// --- TÍNH TOÁN KPI ---
const totalRevenue = computed(() => {
  const listOrders = allOrders.value || []
  if (ordersLoading.value) return 0
  return listOrders
    .filter(
      (order) =>
        order.status === 'Delivered' ||
        order.status === 'Completed' ||
        order.status === 2 ||
        order.status === 5,
    )
    .reduce((sum, order) => sum + order.grandTotal, 0)
})

const newOrdersCount = computed(() => {
  const listOrders = allOrders.value || []
  if (ordersLoading.value) return 0
  // Đếm đơn Pending (1) hoặc New (0)
  return listOrders.filter((order) => order.status === 0 || order.status === 1).length
})

const customerCount = computed(() => {
  const listUsers = allUsers.value || []
  if (usersLoading.value) return 0
  return listUsers.filter((user) => user.role !== 'admin').length
})

// --- LẤY 5 ĐƠN MỚI NHẤT CHO BẢNG ---
const latestOrders = computed(() => {
  const list = allOrders.value || []
  // Copy mảng để sort tránh mutate state gốc, sắp xếp ngày tạo mới nhất -> cắt lấy 5
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
})

// --- SẢN PHẨM BÁN CHẠY (Giả lập logic sort) ---
const bestSellingProducts = computed(() => {
  return [...products.value].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5)
})

const handleViewDetail = (idOrCode) => {
  // Điều hướng sang trang chi tiết đơn hàng Admin
  // idOrCode có thể là ID hoặc OrderCode tùy vào component OrderTable emit ra cái gì
  // Ở file OrderTable bạn gửi, nó emit: order.orderCode || order.id
  router.push(`/admin/orders/${idOrCode}`)
}

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    adminStore.fetchAllUsers(),
    productStore.fetchProducts(),
  ])
})
</script>

<template>
  <main class="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Tổng quan Quản trị</h1>

    <div
      v-if="statsLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse"
    >
      <div v-for="i in 4" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tổng Doanh thu"
        :value="formatPrice(totalRevenue) + ' đ'"
        icon-path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        color="green"
      />

      <StatCard
        title="Đơn hàng mới"
        :value="newOrdersCount"
        subtitle="Đang chờ xử lý"
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

      <OrderTable :orders="latestOrders" :loading="ordersLoading" @view-detail="handleViewDetail" />
    </div>
  </main>
</template>
