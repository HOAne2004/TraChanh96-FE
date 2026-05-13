// src/stores/sales/dashboard.store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/sales/dashboard.service'

export const useDashboardStore = defineStore('dashboard', () => {
  const globalStats = ref({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  })
  const recentOrders = ref([])
  const chartData = ref([])
  const topProducts = ref([])
  const loading = ref(false)
  
  // ⭐️ Đổi mặc định thành today
  const timeFilter = ref('today')

  async function fetchGlobalStats() {
    loading.value = true
    try {
      // Gọi service và truyền giá trị
      const res = await dashboardService.getGlobalStats(timeFilter.value)
      
      // Đảm bảo lấy đúng lớp data của BE
      const data = res.data?.data || res.data

      globalStats.value = {
        totalRevenue:   data.totalRevenue   ?? 0,
        totalOrders:    data.totalOrders    ?? 0,
        totalCustomers: data.totalCustomers ?? 0,
        totalProducts:  data.totalProducts  ?? 0,
      }
      recentOrders.value = data.recentOrders  || []
      chartData.value    = data.chartData     || []
      topProducts.value  = data.topProducts   || []
    } catch (err) {
      console.error('Lỗi tải global stats:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    globalStats, recentOrders, chartData, topProducts, loading, timeFilter, fetchGlobalStats,
  }
})