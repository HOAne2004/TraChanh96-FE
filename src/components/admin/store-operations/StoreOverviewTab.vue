<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToastStore } from '@/stores/system/toast.store'
import storeService from '@/services/store-operations/store.service'

// --- CẤU HÌNH CHART.JS ---
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

// Đăng ký các thành phần bắt buộc của Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  store: { type: Object, required: true }
})

const toastStore = useToastStore()
const isLoading = ref(false)
const timeFilter = ref('today')

// --- STATE DỮ LIỆU ---
const stats = ref({
  revenue: 0, revenueGrowth: 0, isRevenueUp: true,
  tablesInUse: 0, tablesTotal: 0, tablesGrowth: 0, isTablesUp: true,
  ordersCount: 0, ordersGrowth: 0, isOrdersUp: true,
  customersCount: 0, customersGrowth: 0, isCustomersUp: true,
  ratingAverage: 0, ratingCount: 0, ratingGrowth: 0
})

const topProducts = ref([])

// Biến chứa dữ liệu vẽ biểu đồ
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Doanh thu',
    backgroundColor: '#22c55e', // Màu xanh lục của Tailwind
    borderRadius: 6,
    data: []
  }]
})

// Biến chứa cấu hình hiển thị biểu đồ
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            // Format số tiền trong tooltip
            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
    x: { grid: { display: false } } // Ẩn đường kẻ dọc cho đẹp
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

// --- LOGIC GỌI API ---
const fetchDashboardData = async () => {
  if (!props.store?.id) return

  isLoading.value = true
  try {
    const response = await storeService.getStoreDashboard(props.store.id, timeFilter.value)
    const data = response.data

    // 1. Cập nhật Stats
    stats.value = {
      revenue: data.revenue || 0,
      revenueGrowth: data.revenueGrowth > 0 ? `+${data.revenueGrowth}%` : `${data.revenueGrowth}%`,
      isRevenueUp: (data.revenueGrowth || 0) >= 0,
      
      tablesInUse: data.tablesInUse || 0,
      tablesTotal: data.tablesTotal || 0,
      tablesGrowth: data.tablesGrowth || 0,
      isTablesUp: (data.tablesGrowth || 0) >= 0,
      
      ordersCount: data.ordersCount || 0,
      ordersGrowth: data.ordersGrowth > 0 ? `+${data.ordersGrowth}%` : `${data.ordersGrowth}%`,
      isOrdersUp: (data.ordersGrowth || 0) >= 0,
      
      customersCount: data.customersCount || 0,
      customersGrowth: data.customersGrowth > 0 ? `+${data.customersGrowth}%` : `${data.customersGrowth}%`,
      isCustomersUp: (data.customersGrowth || 0) >= 0,
      
      ratingAverage: data.ratingAverage || 0,
      ratingCount: data.ratingCount || 0,
      ratingGrowth: data.ratingGrowth > 0 ? `+${data.ratingGrowth}` : `${data.ratingGrowth}`
    }

    // 2. Cập nhật Top Products
    topProducts.value = data.topProducts || []

    // 3. Biến đổi dữ liệu API (Mảng các object) thành định dạng Chart.js yêu cầu
    if (data.chartData) {
      chartData.value = {
        labels: data.chartData.map(d => d.label), // Trục X (Thời gian)
        datasets: [{
          label: 'Doanh thu',
          backgroundColor: '#22c55e',
          borderRadius: 6,
          data: data.chartData.map(d => d.value) // Trục Y (Giá trị)
        }]
      }
    }

  } catch (error) {
    console.error("Lỗi lấy dữ liệu dashboard:", error)
    toastStore.show({ message: 'Không thể tải dữ liệu thống kê', type: 'error' })
  } finally {
    isLoading.value = false
  }
}

// Lắng nghe sự thay đổi của Dropdown
watch(timeFilter, fetchDashboardData)

// Gọi lần đầu khi mở tab
onMounted(fetchDashboardData)
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Filter -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-green-50 text-green-600 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Tổng quan hoạt động</h2>
      </div>

      <div class="relative w-full sm:w-auto">
        <select
          v-model="timeFilter"
          class="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium cursor-pointer"
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

    <!-- Hàng 1: Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Doanh thu -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="relative z-10">
          <div class="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Doanh thu</div>
          <div class="text-3xl font-extrabold text-gray-900 mb-2">{{ formatPrice(stats.revenue) }} đ</div>
          <div class="flex items-center text-sm font-medium" :class="stats.isRevenueUp ? 'text-green-600' : 'text-red-500'">
            <svg v-if="stats.isRevenueUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
            {{ stats.revenueGrowth }} so với trước
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-green-500 opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Số bàn -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="relative z-10">
          <div class="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số bàn đang dùng</div>
          <div class="text-3xl font-extrabold text-gray-900 mb-2">{{ stats.tablesInUse }} <span class="text-lg text-gray-400 font-medium">/ {{ stats.tablesTotal }}</span></div>
          <div class="flex items-center text-sm font-medium" :class="stats.isTablesUp ? 'text-blue-600' : 'text-red-500'">
            <svg v-if="stats.isTablesUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
            {{ stats.tablesGrowth }} đang chờ
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-blue-500 opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>

      <!-- Số đơn -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="relative z-10">
          <div class="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số đơn hàng</div>
          <div class="text-3xl font-extrabold text-gray-900 mb-2">{{ stats.ordersCount }}</div>
          <div class="flex items-center text-sm font-medium" :class="stats.isOrdersUp ? 'text-green-600' : 'text-red-500'">
            <svg v-if="stats.isOrdersUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
            {{ stats.ordersGrowth }} so với trước
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-purple-500 opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>

      <!-- Số khách -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
        <div class="relative z-10">
          <div class="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số khách</div>
          <div class="text-3xl font-extrabold text-gray-900 mb-2">{{ stats.customersCount }}</div>
          <div class="flex items-center text-sm font-medium" :class="stats.isCustomersUp ? 'text-green-600' : 'text-red-500'">
            <svg v-if="stats.isCustomersUp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v3.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
            {{ stats.customersGrowth }} so với trước
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-24 h-24 text-orange-500 opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
    </div>

    <!-- Hàng 2: Bố cục 2 cột (Charts & Lists) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Cột Trái (Biểu đồ Doanh thu - vue-chartjs) -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900">Biểu đồ Doanh thu</h3>
          <span class="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">ĐVT: VNĐ</span>
        </div>

        <!-- Wrapper cho Chart.js -->
        <div class="flex-1 w-full relative min-h-[300px]">
          <Bar
            :data="chartData"
            :options="chartOptions"
            class="absolute inset-0"
          />
        </div>
      </div>

      <!-- Cột Phải (Top 5 Món Bán Chạy) -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900">Top 5 Bán Chạy</h3>
          <button class="text-sm text-green-600 hover:text-green-800 font-semibold transition-colors">Xem tất cả</button>
        </div>

        <ul class="flex-1 flex flex-col justify-between gap-5">
          <li v-for="(item, index) in topProducts" :key="item.id" class="flex items-center gap-4 group cursor-pointer p-1 rounded-xl hover:bg-gray-50 transition-colors">

            <!-- Rank Badge -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              :class="index === 0 ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900 shadow-sm' :
                      index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 shadow-sm' :
                      index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900 shadow-sm' :
                      'bg-gray-100 text-gray-500 border border-gray-200'"
            >
              {{ index + 1 }}
            </div>

            <!-- Image -->
            <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm shrink-0">
              <img :src="item.image" :alt="item.name" class="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-300">
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">{{ item.name }}</h4>
              <p class="text-xs font-medium text-gray-500 mt-0.5">{{ item.sold }} sản phẩm</p>
            </div>

            <!-- Revenue -->
            <div class="text-right">
              <div class="text-sm font-bold text-gray-900">{{ formatPrice(item.revenue) }} đ</div>
            </div>
          </li>

          <li v-if="!topProducts.length" class="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm py-8">
            <svg class="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p>Chưa có dữ liệu bán hàng.</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Hàng 3: Đánh giá & Feedback (Trải ngang) -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-5 w-full sm:w-auto">
        <!-- Badge điểm số -->
        <div class="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 shrink-0 shadow-sm">
          <span class="text-2xl font-black text-yellow-600">{{ stats.ratingAverage }}</span>
        </div>

        <!-- Chi tiết -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            Đánh giá trung bình
            <div class="flex text-yellow-400">
              <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" /></svg>
            </div>
          </h3>
          <p class="text-sm font-medium text-gray-500 mt-1">Dựa trên <strong class="text-gray-900">{{ stats.ratingCount }}</strong> lượt đánh giá từ khách hàng.</p>
        </div>
      </div>

      <div class="w-full sm:w-auto flex justify-start sm:justify-end">
        <div class="inline-flex items-center px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1.5"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
          Tăng {{ stats.ratingGrowth }} điểm so với tháng trước
        </div>
      </div>
    </div>
  </div>
</template>
