import { defineStore } from 'pinia'
import { ref } from 'vue'
import socialMediaService from '@/services/socialMedia.service'

export const useSocialMediaStore = defineStore('socialMedia', () => {
  // --- STATE ---
  const socials = ref([])
  const adminSocials = ref([])
  const currentSocial = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- PUBLIC ---

  /**
   * Lấy social media active (Footer / Header)
   */
  async function fetchActiveSocials(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await socialMediaService.getActive(params)
      socials.value = res.data
    } catch (err) {
      console.error(err)
      socials.value = []
    } finally {
      loading.value = false
    }
  }

  // --- ADMIN ---

  async function fetchAdminSocials(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await socialMediaService.getAll(filters)
      adminSocials.value = res.data
    } catch (err) {
      error.value = 'Không thể tải danh sách social media'
    } finally {
      loading.value = false
    }
  }

  async function fetchSocialById(id) {
    loading.value = true
    error.value = null
    try {
      const res = await socialMediaService.getById(id)
      currentSocial.value = res.data
    } catch (err) {
      currentSocial.value = null
      error.value = 'Không tìm thấy social media'
    } finally {
      loading.value = false
    }
  }

  async function createSocial(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await socialMediaService.create(payload)
      adminSocials.value.unshift(res.data)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo social media thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSocial(id, payload) {
    loading.value = true
    error.value = null
    try {
      const res = await socialMediaService.update(id, payload)

      const index = adminSocials.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        adminSocials.value[index] = res.data
      }

      if (currentSocial.value?.id === id) {
        currentSocial.value = res.data
      }

      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSocial(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa social media này?')) return

    loading.value = true
    error.value = null
    try {
      await socialMediaService.delete(id)
      adminSocials.value = adminSocials.value.filter((s) => s.id !== id)
    } catch (err) {
      error.value = 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    socials,
    adminSocials,
    currentSocial,
    loading,
    error,
    fetchActiveSocials,
    fetchAdminSocials,
    fetchSocialById,
    createSocial,
    updateSocial,
    deleteSocial,
  }
})
