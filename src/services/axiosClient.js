// src/services/axiosClient.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useModalStore } from '@/stores/modal'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

let userStore = null

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
    // ⭐️ FIX QUAN TRỌNG: Lấy token trực tiếp từ localStorage
    // Lý do: Store có thể chưa kịp cập nhật state ngay lập tức sau khi login,
    // nhưng localStorage.setItem() là đồng bộ nên chắc chắn đã có dữ liệu.
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!userStore) userStore = useUserStore()
    const toast = useToastStore()
    const modal = useModalStore()
    const status = error.response?.status
    const originalRequest = error.config

    const message =
      error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại'

    // 401 – Hết hạn token hoặc Unauthorized
    if (status === 401) {
      // ⭐️ FIX: Nếu lỗi 401 xảy ra khi đang gọi API Login (do sai pass)
      // thì TRẢ LỖI VỀ cho LoginForm xử lý, KHÔNG hiện popup hết hạn.
      if (originalRequest.url && originalRequest.url.includes('/Auth/login')) {
         return Promise.reject(error)
      }

      // Các trường hợp khác (đang lướt web thì hết hạn token)
      toast.show({
        type: 'warning',
        message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      })

      userStore.logout()
      modal.openLoginModal()
      return Promise.reject(error)
    }

    // Nếu request cấu hình silent (không muốn hiện toast lỗi)
    if (error.config?.silent) {
      return Promise.reject(error)
    }

    // Các lỗi còn lại (500, 400, 404...)
    toast.show({
      type: 'error',
      message,
    })

    return Promise.reject(error)
  },
)

export default api
