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

      const userStore = useUserStore()
      const userId = userStore.user?.id || 'guest'
      const deletedKey = `deletedNotis_${userId}`
      const readKey = `readNotis_${userId}`

      const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]')
      const readIds = JSON.parse(localStorage.getItem(readKey) || '[]')

      // Lọc bỏ những thông báo đã xóa khỏi local, và cập nhật trạng thái isRead dựa vào local cache cho broadcast
      notifications.value = response.data
        .filter((n) => !deletedIds.includes(n.id))
        .map((n) => {
          if (readIds.includes(n.id)) {
            n.isRead = true
          }
          return n
        })
    } catch (err) {
      console.error(err)
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
    try {
      await notificationService.markAsRead(id)
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err)
      // Vẫn tiếp tục xử lý UI (Optimistic)
    }

    const noti = notifications.value.find((n) => n.id === id)
    if (noti && !noti.isRead) {
      noti.isRead = true
      // Lưu vào cache để những thông báo chung (broadcast) vẫn giữ được trạng thái Read
      const userStore = useUserStore()
      const userId = userStore.user?.id || 'guest'
      const readKey = `readNotis_${userId}`
      const readIds = JSON.parse(localStorage.getItem(readKey) || '[]')
      if (!readIds.includes(id)) {
        readIds.push(id)
        localStorage.setItem(readKey, JSON.stringify(readIds))
      }
    }
  }

  async function markAllAsReadAction() {
    const unreadItems = notifications.value.filter((n) => !n.isRead)
    if (unreadItems.length === 0) return

    // Cập nhật UI ngay lập tức
    unreadItems.forEach((n) => {
      n.isRead = true
    })

    const userStore = useUserStore()
    const userId = userStore.user?.id || 'guest'
    const readKey = `readNotis_${userId}`
    let readIds = JSON.parse(localStorage.getItem(readKey) || '[]')

    unreadItems.forEach((n) => {
      if (!readIds.includes(n.id)) readIds.push(n.id)
    })
    localStorage.setItem(readKey, JSON.stringify(readIds))

    // Gọi API song song cho tất cả để không bị chậm
    await Promise.allSettled(unreadItems.map((item) => notificationService.markAsRead(item.id)))
  }

  async function deleteNotificationAction(id) {
    // Ẩn phía UI
    notifications.value = notifications.value.filter((n) => n.id !== id)

    // Lưu cache
    const userStore = useUserStore()
    const userId = userStore.user?.id || 'guest'
    const deletedKey = `deletedNotis_${userId}`
    const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]')

    if (!deletedIds.includes(id)) {
      deletedIds.push(id)
      localStorage.setItem(deletedKey, JSON.stringify(deletedIds))
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
    deleteNotificationAction,
    initSignalR,
    stopSignalR,
    fetchAdminNotifications,
    adminNotifications,
    totalAdminNotis,
  }
})
