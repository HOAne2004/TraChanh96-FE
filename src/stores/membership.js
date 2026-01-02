// src/stores/membership.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import membershipService from '@/services/membership.service'

export const useMembershipStore = defineStore('membership', () => {
  // --- STATE ---
  const membership = ref(null) // Lưu object thông tin thành viên (không phải mảng)
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Kiểm tra xem User có phải là thành viên hay chưa
   * Trả về true nếu object membership khác null
   */
  const isMember = computed(() => !!membership.value)

  /**
   * Lấy tên hạng thành viên (Level Name) an toàn
   * Giả định MembershipReadDto có cấu trúc: { level: { name: 'Vàng', ... }, ... }
   */
  const currentLevelName = computed(() => {
    return membership.value?.level?.name || 'Chưa xếp hạng'
  })

  /**
   * Lấy điểm tích lũy an toàn
   */
  const currentPoints = computed(() => {
    return membership.value?.totalPoint || 0
  })

  // --- ACTIONS ---

  /**
   * Lấy thông tin thành viên của tôi
   */
  async function fetchMyMembership() {
    loading.value = true
    error.value = null
    membership.value = null // Reset trước khi fetch
    try {
      const response = await membershipService.getMyMembership()
      membership.value = response.data
    } catch (err) {
      // Xử lý trường hợp 404 (Chưa kích hoạt thành viên) riêng nếu cần
      if (err.response && err.response.status === 404) {
        // User chưa có thẻ thành viên -> membership vẫn là null
        console.warn('User chưa kích hoạt thành viên')
      } else {
        console.error(err)
        error.value = err.response?.data?.message || 'Lỗi tải thông tin thành viên'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    membership,
    isMember,
    currentLevelName,
    currentPoints,
    loading,
    error,
    fetchMyMembership
  }
})
