import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import settingService from '@/services/system/setting.service'

export const useSettingStore = defineStore('setting', () => {
  // --- STATE ---
  const settings = ref([])
  const loading = ref(false)

  // --- GETTERS ---
  // Hàm helper lấy giá trị linh động kèm fallback (dự phòng)
  const getSettingValue = (key, defaultValue) => {
    const setting = settings.value.find((s) => s.key === key)
    return setting ? setting.value : defaultValue
  }

  // Các biến Getter dùng thường xuyên (ép kiểu sẵn)
  const maxQuantityPerItem = computed(() => parseInt(getSettingValue('MaxQuantityPerItem', 20)))
  const maxTotalItemsPerOrder = computed(() => parseInt(getSettingValue('MaxTotalItemsPerOrder', 50)))
  const autoCancelMinutes = computed(() => parseInt(getSettingValue('OrderAutoCancelMinutes', 5)))

  // --- ACTIONS ---
  async function fetchSettings() {
    // Nếu đã có data thì không gọi lại API nữa (Cache)
    if (settings.value.length > 0) return

    loading.value = true
    try {
      const res = await settingService.getAllSettings()
      // Đảm bảo cấu trúc trỏ đúng vào nơi chứa mảng dữ liệu (ví dụ res.data.data tùy BE của bạn trả về)
      settings.value = res.data?.data || [] 
    } catch (error) {
      console.error('Lỗi khi tải cấu hình hệ thống:', error)
    } finally {
      loading.value = false
    }
  }

  // (Dành cho Admin) Lưu lại setting
  async function updateSetting(key, value) {
    await settingService.updateSetting(key, value)
    // Sau khi update thành công, cập nhật lại State hiện tại
    const index = settings.value.findIndex(s => s.key === key)
    if (index !== -1) {
      settings.value[index].value = value.toString()
    } else {
      settings.value.push({ key, value: value.toString() })
    }
  }

  return {
    settings,
    loading,
    maxQuantityPerItem,
    maxTotalItemsPerOrder,
    autoCancelMinutes,
    fetchSettings,
    updateSetting
  }
})