// src/services/api/axiosClient.js
import axios from 'axios'
import { useUserStore } from '@/stores/identity/user.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useModalStore } from '@/stores/system/modal.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

let userStore = null

// --- THÊM LOGIC KHỬ TRÙNG LẶP TOAST ---
const activeToasts = new Set()

function showUniqueToast(toastStore, type, message) {
  // Đảm bảo message là chuỗi để so sánh (tránh lỗi object)
  const safeMessage = typeof message === 'string' ? message : JSON.stringify(message)

  // Nếu thông báo này đang hiển thị rồi thì bỏ qua luôn
  if (activeToasts.has(safeMessage)) return

  // Thêm vào danh sách đang hiển thị và gọi Toast
  activeToasts.add(safeMessage)
  toastStore.show({ type, message: safeMessage })

  // Đặt thời gian tự động xóa khỏi danh sách (ví dụ: 3000ms = 3 giây)
  setTimeout(() => {
    activeToasts.delete(safeMessage)
  }, 3000)
}
// -------------------------------------

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
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

    // ⭐️ Xử lý lỗi BE sập hoặc mất mạng (ERR_CONNECTION_REFUSED)
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      showUniqueToast(toast, 'error', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!')
      return Promise.reject(error)
    }

    const message =
      error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra, vui lòng thử lại'

    // 401 – Hết hạn token hoặc Unauthorized
    if (status === 401) {
      if (originalRequest.url && originalRequest.url.includes('/Auth/login')) {
        return Promise.reject(error)
      }

      // Dùng hàm khử trùng lặp thay vì gọi trực tiếp toast.show()
      showUniqueToast(toast, 'warning', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')

      userStore.logout()
      modal.openLoginModal()
      return Promise.reject(error)
    }

    if (error.config?.silent) {
      return Promise.reject(error)
    }

    // Dùng hàm khử trùng lặp cho các lỗi còn lại
    showUniqueToast(toast, 'error', message)

    return Promise.reject(error)
  },
)

export default api
