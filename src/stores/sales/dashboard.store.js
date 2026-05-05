// src/stores/sales/dashboard.store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/sales/dashboard.service'

export const useDashboardStore = defineStore('dashboard', () => {
  // --- STATE ---
  const globalStats = ref({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  })
  const recentOrders = ref([])
  const chartData = ref([])    // [{ label: '01/05', value: 123000 }, ...]
  const topProducts = ref([])  // [{ id, name, image, sold, revenue }, ...]
  const loading = ref(false)
  const timeFilter = ref('week')

  // --- ACTIONS ---
  async function fetchGlobalStats() {
    loading.value = true
    try {
      const res = await dashboardService.getGlobalStats(timeFilter.value)
      const data = res.data

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
    globalStats,
    recentOrders,
    chartData,
    topProducts,
    loading,
    timeFilter,
    fetchGlobalStats,
  }
})
