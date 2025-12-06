// src/api/appApi.js
import api from './index'

const handleError = (error, name) => {
  console.error(`❌ Lỗi khi fetch ${name}:`, error.message)
  throw error
}

const appApi = {
  async fetchFooterInfo() {
    try {
      const { data } = await api.get('api/footerInfo')
      return data
    } catch (err) {
      handleError(err, 'footerInfo')
    }
  },
  async fetchPolicy() {
    try {
      const { data } = await api.get('api/policy')
      return data
    } catch (err) {
      handleError(err, 'policy')
    }
  },

  async fetchCarousel() {
    try {
      const { data } = await api.get('api/carousel')
      return data
    } catch (error) {
      console.error('❌ Lỗi khi fetch carousel:', error.message)
      throw error
    }
  },
  async getAppConfig() {
    try {
      const { data } = await api.get('api/appConfig')
      return data
    } catch (error) {
      console.error('❌ Lỗi khi fetch appConfig:', error.message)
      throw error
    }
  },
}

export default appApi
