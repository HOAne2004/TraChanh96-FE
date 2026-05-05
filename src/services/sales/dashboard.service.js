// src/services/sales/dashboard.service.js
import api from '../api/axiosClient'

const ENDPOINT = '/dashboard'

export default {
  /**
   * [ADMIN] Lấy dữ liệu tổng quan toàn hệ thống
   * GET /api/dashboard/global-stats
   * Returns: { totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders, chartData, topProducts }
   */
  getGlobalStats(timeFilter = 'week') {
    return api.get(`${ENDPOINT}/global-stats`, { params: { timeFilter } })
  },
}
