<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

// --- CHART.JS ---
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// --- STORES ---
import { useDashboardStore } from '@/stores/sales/dashboard.store'

// --- UTILS & CONSTANTS ---
import { formatPrice, formatCurrencyCompact, formatDate } from '@/utils/formatters'
import { ORDER_STATUS_UI } from '@/constants/order.constants'

// --- COMPONENTS ---
import StatCard     from '@/components/admin/sales/AdminStatCard.vue'
import AdminDataTable from '@/components/admin/shared/AdminDataTable.vue'

const router = useRouter()
const dashboardStore = useDashboardStore()
const { globalStats, recentOrders, chartData, topProducts, loading, timeFilter } = storeToRefs(dashboardStore)

// --- CHARTS ---
const barChartData = computed(() => ({
  labels: chartData.value.map((d) => d.label),
  datasets: [{
    label: 'Doanh thu',
    backgroundColor: '#22c55e',
    borderRadius: 6,
    data: chartData.value.map((d) => d.value),
  }],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) =>
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ctx.parsed.y),
      },
    },
  },
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
    x: { grid: { display: false } },
  },
}

// --- TABLE ---
const dashboardColumns = [
  { key: 'orderCode',     label: 'Mã đơn',     cellClass: 'font-medium text-green-600' },
  { key: 'recipientName', label: 'Khách hàng' },
  { key: 'createdAt',     label: 'Thời gian',  cellClass: 'text-gray-500 text-xs' },
  { key: 'grandTotal',    label: 'Tổng tiền',  cellClass: 'font-bold text-right', headerClass: 'text-right' },
  { key: 'status',        label: 'Trạng thái', cellClass: 'text-center',          headerClass: 'text-center' },
]

const getStatusConfig = (statusEnum) => ORDER_STATUS_UI[statusEnum] || {}

const handleViewDetail = (idOrCode) =>
  router.push({ name: 'admin.orders.detail', params: { code: idOrCode } })

// --- LIFECYCLE ---
onMounted(() => dashboardStore.fetchGlobalStats())
watch(timeFilter, () => dashboardStore.fetchGlobalStats())
</script>

<template>
  <main class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">

    <!-- Header & Filter -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tổng quan Quản trị</h1>

      <div class="relative w-full sm:w-auto">
        <select
          v-model="timeFilter"
          class="w-full sm:w-48 appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium cursor-pointer shadow-sm"
        >
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Stat Cards: Skeleton -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse mb-6"
    >
      <div v-for="i in 4" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>

    <!-- Stat Cards: Data -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div :title="'Chi tiết: ' + formatPrice(globalStats.totalRevenue) + ' VND'">
        <StatCard
          title="Tổng Doanh thu"
          :value="formatCurrencyCompact(globalStats.totalRevenue) + ' VND'"
          subtitle="Trên toàn hệ thống"
          icon-path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          color="green"
        />
      </div>
      <StatCard
        title="Tổng Đơn hàng"
        :value="globalStats.totalOrders"
        subtitle="Đã được đặt"
        icon-path="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        color="yellow"
      />
      <StatCard
        title="Tổng Khách hàng"
        :value="globalStats.totalCustomers"
        subtitle="Tài khoản đã đăng ký"
        icon-path="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        color="blue"
      />
      <StatCard
        title="Tổng Sản phẩm"
        :value="globalStats.totalProducts"
        subtitle="Đang bán trên hệ thống"
        icon-path="M6.5 8 C9 6.5,15 6.5,17.5 8 M6.5 8 C8 3,16 3,17.5 8 V10 C16 9.3,8 9.3,6.5 10 Z M7 10 L8 20 C9.5 21.5,14.5 21.5,16 20 L17 10 Z M8 14 C9.5 13,14.5 13.5,16 12.5 M8 20 C9.5 21,14.5 21,16 20"
        color="red"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

      <!-- Revenue Bar Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Biểu đồ Doanh thu</h2>
          <span class="text-sm font-medium px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-800">
            ĐVT: VNĐ
          </span>
        </div>
        <div class="flex-1 w-full relative min-h-[280px]">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
          </div>
          <Bar v-else :data="barChartData" :options="barChartOptions" class="absolute inset-0" />
        </div>
      </div>

      <!-- Top 5 Products -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Top 5 Bán Chạy</h2>
          <button
            class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 font-semibold transition-colors"
            @click="router.push('/admin/products')"
          >
            Xem tất cả
          </button>
        </div>

        <div v-if="loading" class="flex-1 space-y-4 animate-pulse">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600" />
            <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-600 shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
              <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
            </div>
          </div>
        </div>

        <ul v-else class="flex-1 flex flex-col justify-between gap-4">
          <li
            v-for="(item, index) in topProducts"
            :key="item.id"
            class="flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <!-- Rank Badge -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              :class="
                index === 0 ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900 shadow-sm' :
                index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 shadow-sm' :
                index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900 shadow-sm' :
                'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
              "
            >{{ index + 1 }}</div>

            <!-- Image -->
            <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
              <img :src="item.image" :alt="item.name" class="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {{ item.name }}
              </h4>
              <p class="text-xs font-medium text-gray-500 mt-0.5">{{ item.sold }} sản phẩm</p>
            </div>

            <!-- Revenue -->
            <div class="text-right shrink-0">
              <div class="text-sm font-bold text-gray-900 dark:text-white">{{ formatPrice(item.revenue) }} đ</div>
            </div>
          </li>
          <li v-if="!topProducts.length" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Chưa có dữ liệu
          </li>
        </ul>
      </div>
    </div>

    <!-- Latest Orders Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Đơn hàng mới nhất</h2>
        <button
          @click="router.push('/admin/orders')"
          class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-semibold transition-colors"
        >
          Xem tất cả &rarr;
        </button>
      </div>

      <AdminDataTable
        :items="recentOrders"
        :columns="dashboardColumns"
        :loading="loading"
        :pagination="null"
        @action="({ type, item }) => type === 'row-click' && handleViewDetail(item.orderCode || item.id)"
      >
        <template #cell-orderCode="{ item }">#{{ item.orderCode || item.id }}</template>

        <template #cell-recipientName="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-white">
              {{ item.recipientName || item.userName || 'Khách lẻ' }}
            </span>
            <span class="text-xs text-gray-500">{{ item.recipientPhone }}</span>
          </div>
        </template>

        <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>

        <template #cell-grandTotal="{ value }">{{ formatPrice(value) }} đ</template>

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
      </AdminDataTable>
    </div>

  </main>
</template>
