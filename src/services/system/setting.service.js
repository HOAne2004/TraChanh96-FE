import api from '@/services/api/axiosClient'

class SettingService {
  getAllSettings() {
    return api.get('/settings')
  }

  // (Dành cho Admin) Cập nhật cấu hình
  updateSetting(key, value) {
    return api.put(`/settings/${key}`, { value })
  }
}

export default new SettingService();