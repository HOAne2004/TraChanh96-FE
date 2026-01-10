// src/stores/store.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import storeService from '@/services/store.service'

export const useStoreStore = defineStore('store', () => {
  // --- STATE ---
  const stores = ref([]) // Danh sách active (Client) hoặc all (Admin)
  const currentStore = ref(null) // Cửa hàng đang xem chi tiết hoặc đang chọn để đặt hàng
  const loading = ref(false)
  const error = ref(null)
  const selectedStoreId = ref(null)


  const BUFFER_MINUTES = 30

  // --- GETTERS ---

  // Lấy thông tin object của store đang được chọn
  const selectedStore = computed(() => {
    return stores.value.find(s => s.id === selectedStoreId.value) || null
  })

  /**
   * Helper kiểm tra trạng thái hoạt động của 1 cửa hàng
   * Trả về object: { isOpen: boolean, message: string }
   */
  const getStoreStatus = computed(() => (store) => {
    if (!store) return { isOpen: false, message: 'Chưa chọn cửa hàng' }

    // 1. Kiểm tra trạng thái do Admin set (Active/Inactive/Closed/...)
    // Giả sử Backend trả về Status là string "Active"
    if (store.status !== 'Active') {
        return { isOpen: false, message: 'Tạm đóng cửa' }
    }

    // 2. Kiểm tra giờ mở cửa
    if (!store.openTime || !store.closeTime) {
        return { isOpen: false, message: 'Chưa cập nhật giờ' }
    }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // Parse OpenTime (HH:mm:ss)
    const [openH, openM] = store.openTime.split(':').map(Number)
    const openTotalMinutes = openH * 60 + openM

    // Parse CloseTime (HH:mm:ss)
    const [closeH, closeM] = store.closeTime.split(':').map(Number)
    const closeTotalMinutes = closeH * 60 + closeM

    // Tính thời gian ngừng nhận đơn (Last Order)
    const lastOrderMinutes = closeTotalMinutes - BUFFER_MINUTES

    // LOGIC SO SÁNH
    // Trường hợp 1: Mở và đóng trong cùng 1 ngày (VD: 08:00 - 22:00)
    if (closeTotalMinutes > openTotalMinutes) {
        if (currentMinutes < openTotalMinutes) {
            return { isOpen: false, message: `Mở cửa lúc ${openH}:${openM < 10 ? '0'+openM : openM}` }
        }
        if (currentMinutes >= lastOrderMinutes && currentMinutes < closeTotalMinutes) {
             return { isOpen: false, message: 'Đã ngừng nhận đơn' } // Trong khoảng buffer
        }
        if (currentMinutes >= closeTotalMinutes) {
            return { isOpen: false, message: 'Đã đóng cửa' }
        }
    }
    // Trường hợp 2: Mở qua đêm (VD: 18:00 - 02:00 sáng hôm sau) - Ít gặp nhưng nên cover
    else {
        // Logic qua đêm (Optional): Nếu hiện tại < close (VD: 01:00) HOẶC hiện tại > open (VD: 23:00)
        const isNextDay = currentMinutes < closeTotalMinutes;
        const isLateNight = currentMinutes >= openTotalMinutes;

        if (!isNextDay && !isLateNight) {
             return { isOpen: false, message: `Mở cửa lúc ${store.openTime}` }
        }

        // Check last order cho ca đêm
        // Nếu đang là rạng sáng (01:45) và close là 02:00 -> chặn
        if (isNextDay && currentMinutes >= lastOrderMinutes) {
            return { isOpen: false, message: 'Đã ngừng nhận đơn (Sắp đóng cửa)' }
        }
    }

    return { isOpen: true, message: 'Đang mở cửa' }
  })

  // Shortcut để kiểm tra nhanh store đang chọn có mua được không
  const canOrderCurrentStore = computed(() => {
      if (!selectedStore.value) return false
      return getStoreStatus.value(selectedStore.value).isOpen
  })
  // --- ACTIONS ---

  /**
   * [PUBLIC] Lấy danh sách cửa hàng active
   */
  async function fetchActiveStores() {
    loading.value = true
    error.value = null
    try {
      const res = await storeService.getActiveStores()
      stores.value = res.data
    } catch (err) {
      console.error('Lỗi tải danh sách cửa hàng:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * [PUBLIC] Lấy chi tiết theo Slug
   */
  async function fetchStoreBySlug(slug) {
    loading.value = true
    try {
      const res = await storeService.getBySlug(slug)
      currentStore.value = res.data
    } catch (err) {
      console.error(`Lỗi tải cửa hàng ${slug}:`, err)
      error.value = 'Không tìm thấy cửa hàng'
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Lấy danh sách quản trị
   */
  async function fetchAdminStores(params = {}) {
    loading.value = true
    try {
      const res = await storeService.getAllAdmin(params)
      stores.value = res.data
    } catch (err) {
      console.error('Lỗi tải admin stores:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo mới cửa hàng
   * Lưu ý: Vì StoreCreateDto yêu cầu AddressId, nên ở UI Admin:
   * 1. Cần tạo Address trước (gọi addressService.create)
   * 2. Lấy ID của Address vừa tạo -> Truyền vào AddressId của Store
   */
  async function createStore(payload) {
    loading.value = true
    try {
      const res = await storeService.create(payload)
      // Thêm vào danh sách hiện tại
      stores.value.unshift(res.data)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tạo cửa hàng'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Cập nhật cửa hàng
   */
  async function updateStore(id, payload) {
    loading.value = true
    try {
      const res = await storeService.update(id, payload)
      // Cập nhật local
      const index = stores.value.findIndex((s) => s.id === id)
      if (index !== -1) stores.value[index] = res.data

      // Nếu đang xem chi tiết store này thì update luôn
      if (currentStore.value && currentStore.value.id === id) {
        currentStore.value = res.data
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi cập nhật'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Xóa cửa hàng
   */
  async function deleteStore(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) return

    loading.value = true
    try {
      await storeService.delete(id)
      stores.value = stores.value.filter((s) => s.id !== id)
    } catch (err) {
      alert('Không thể xóa cửa hàng này')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ ACTION MỚI: Chọn cửa hàng
  function setSelectedStore(id) {
    selectedStoreId.value = id
  }


  return {
    stores,
    currentStore,
    loading,
    error,
    selectedStore,
    getStoreStatus,
    canOrderCurrentStore,
    selectedStoreId,
    fetchActiveStores,
    fetchStoreBySlug,
    fetchAdminStores,
    createStore,
    updateStore,
    deleteStore,
    setSelectedStore,
  }
})
