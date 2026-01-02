// src/stores/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notificationService from '@/services/notification.service'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useUserStore } from '@/stores/user'

export const useNotificationStore = defineStore('notification', () => {
  // --- STATE ---
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const connection = ref(null)
  const adminNotifications = ref([])
  const totalAdminNotis = ref(0)
  // --- COMPUTED ---
  /**
   * Đếm số lượng thông báo chưa đọc (IsRead == false)
   * Dùng để hiển thị badge trên icon chuông
   */
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.isRead).length
  })

  // --- ACTIONS ---

  /**
   * Lấy danh sách thông báo
   */
  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      const response = await notificationService.getMyNotifications()
      notifications.value = response.data
    } catch (err) {
      console.error(err)
      // Không cần hiện lỗi quá gắt gao với thông báo, chỉ log
      error.value = err.response?.data?.message || 'Lỗi tải thông báo'
    } finally {
      loading.value = false
    }
  }

  /**
   * [Admin] Gửi thông báo
   */
  async function createNotificationAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await notificationService.create(createDto)
      // Nếu Admin tự gửi cho mình hoặc gửi chung thì có thể load lại
      // Nhưng thường Admin gửi xong sẽ ở trang quản lý, không ảnh hưởng chuông báo ngay
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Gửi thông báo thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Đánh dấu đã đọc
   * @param {number} id - ID thông báo
   */
  async function markAsReadAction(id) {
    // Không cần loading toàn trang
    try {
      await notificationService.markAsRead(id)

      // Cập nhật state ở Client ngay lập tức (Optimistic Update)
      // Tìm thông báo trong list và set isRead = true
      const noti = notifications.value.find((n) => n.id === id)
      if (noti) {
        noti.isRead = true
      }
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err)
      // Có thể throw hoặc bỏ qua tùy trải nghiệm người dùng
    }
  }

  /**
   * (Optional) Đánh dấu tất cả là đã đọc (FE Loop)
   * Vì BE chưa có API markAllAsRead, ta có thể tạm thời loop hoặc đợi BE bổ sung.
   * Hiện tại hàm này chỉ mang tính demo logic.
   */
  async function markAllAsReadAction() {
    const unreadItems = notifications.value.filter((n) => !n.isRead)
    // Gọi song song hoặc tuần tự
    for (const item of unreadItems) {
      await markAsReadAction(item.id)
    }
  }

  // 🟢 ACTION: Khởi tạo kết nối SignalR
  async function initSignalR() {
    const userStore = useUserStore()
    if (!userStore.token) return // Chưa login thì thôi

    // Tránh tạo nhiều kết nối trùng lặp
    if (connection.value) return

    const newConnection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_API_URL_SIGNALR || 'https://localhost:7030/hub/notifications', {
        accessTokenFactory: () => userStore.token, // Gửi kèm Token để Auth
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build()

    // Lắng nghe sự kiện từ Server
    newConnection.on('ReceiveNotification', (notification) => {
      // Đẩy thông báo mới nhất lên đầu danh sách
      notifications.value.unshift(notification)

      // (Optional) Có thể play âm thanh hoặc hiện Toast nhỏ ở đây
    })

    try {
      await newConnection.start()
      console.log('SignalR Connected')
      connection.value = newConnection
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
    }
  }

  // 🟢 ACTION: Ngắt kết nối (khi Logout)
  async function stopSignalR() {
    if (connection.value) {
      await connection.value.stop()
      connection.value = null
    }
  }
  async function fetchAdminNotifications(params) {
    loading.value = true
    try {
      const res = await notificationService.getAll(params)
      adminNotifications.value = res.data.items
      totalAdminNotis.value = res.data.totalRecords
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }
  return {
    notifications,
    unreadCount,
    loading,
    error,
    connection,
    fetchNotifications,
    createNotificationAction,
    markAsReadAction,
    markAllAsReadAction,
    initSignalR,
    stopSignalR,
    fetchAdminNotifications,
    adminNotifications,
    totalAdminNotis,
  }
})
