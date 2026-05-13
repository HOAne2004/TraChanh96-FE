// src/services/sales/dashboard.service.js
import api from '../api/axiosClient'

const ENDPOINT = '/dashboard'

export default {
  getGlobalStats(timeframe = 'today') {
    return api.get(`${ENDPOINT}/global-stats`, { params: { timeframe } })
  },
}