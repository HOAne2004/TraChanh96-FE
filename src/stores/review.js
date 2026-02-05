import { defineStore } from 'pinia'
import { ref } from 'vue'
import reviewService from '@/services/review.service'
import { useToastStore } from '@/stores/toast'

export const useReviewStore = defineStore('review', () => {
  // --- STATE ---
  const reviews = ref([]) // Danh sách review hiện tại
  const canReview = ref(false) // User có được quyền review món này không?
  const adminReviews = ref([]) // Danh sách review hiện tại
  const adminTotalItems = ref(0) // Tổng số item
  const loading = ref(false) // Trạng thái loading chung
  const submitting = ref(false) // Trạng thái khi đang gửi form (để disable nút)

  const toast = useToastStore()

  // --- ACTIONS ---

  /**
   * Lấy danh sách review của 1 sản phẩm
   */
  async function fetchReviews(productId) {
    loading.value = true
    try {
      const res = await reviewService.getReviewsByProduct(productId)
      reviews.value = res.data || []
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err)
      reviews.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Kiểm tra quyền đánh giá
   * (Gọi khi vào trang chi tiết sản phẩm)
   */
  async function checkUserEligibility(productId) {
    canReview.value = false
    try {
      const res = await reviewService.checkEligibility(productId)
      // Backend trả về { canReview: true/false }
      canReview.value = res.data?.canReview || false
    } catch (err) {
      // Lỗi 401 (chưa login) hoặc lỗi khác -> coi như không được review
      canReview.value = false
    }
  }

  /**
   * Gửi đánh giá mới
   * @param {Object} payload - { orderId, productId, rating, content, ... }
   */
  async function submitReview(payload) {
    submitting.value = true
    try {
      await reviewService.createReview(payload)

      toast.show({
        type: 'success',
        message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
      })

      // Sau khi gửi xong:
      // 1. Tải lại danh sách review để hiện cái mới
      await fetchReviews(payload.productId)
      // 2. Check lại quyền (thường là sẽ mất quyền review tiếp)
      await checkUserEligibility(payload.productId)

      return true // Trả về true để Component đóng Modal/Form
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá.'
      toast.show({ type: 'error', message: msg })
      return false
    } finally {
      submitting.value = false
    }
  }

  /**
   * Chỉnh sửa đánh giá
   */
  async function editReview(reviewId, payload, productId) {
    submitting.value = true
    try {
      await reviewService.updateReview(reviewId, payload)

      toast.show({
        type: 'success',
        message: 'Đã cập nhật đánh giá của bạn.',
      })

      await fetchReviews(productId) // Refresh list
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật đánh giá.'
      toast.show({ type: 'error', message: msg })
      return false
    } finally {
      submitting.value = false
    }
  }

  /**
   * Xóa đánh giá
   */
  async function removeReview(reviewId, productId) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này không?')) return

    loading.value = true // Dùng loading nhẹ hoặc submitting
    try {
      await reviewService.deleteReview(reviewId)

      toast.show({
        type: 'success',
        message: 'Đã xóa đánh giá.',
      })

      await fetchReviews(productId)
      // Check lại quyền (có thể user được review lại sau khi xóa? Tùy logic BE)
      await checkUserEligibility(productId)
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi xóa đánh giá.'
      toast.show({ type: 'error', message: msg })
    } finally {
      loading.value = false
    }
  }
  // ==========================================================
  // 🟢 ADMIN ACTIONS (Mới bổ sung)
  // ==========================================================

  /**
   * Lấy danh sách review cho trang quản lý
   * @param {Object} filterParams
   */
  async function fetchAdminReviews(filterParams) {
    loading.value = true
    try {
      const res = await reviewService.getReviewsForAdmin(filterParams)
      //console.log("🔥 API Response:", res.data)
      if (Array.isArray(res.data)) {
          adminReviews.value = res.data
          adminTotalItems.value = res.data.length // Tạm thời lấy length làm total
      } else {
          // Trường hợp 2: API trả về PagedResult { items: [], totalItems: 100 }
          adminReviews.value = res.data.items || []
          adminTotalItems.value = res.data.totalItems || 0
      }
    } catch (err) {
      console.error('Admin fetch error:', err)
      toast.show({ type: 'error', message: 'Lỗi tải danh sách đánh giá.' })
      adminReviews.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin duyệt/ẩn hoặc trả lời đánh giá
   */
  async function updateReviewStatusOrReply(reviewId, payload) {
    // payload: { status, adminResponse }
    submitting.value = true
    try {
      await reviewService.adminUpdateReview(reviewId, payload)

      toast.show({ type: 'success', message: 'Cập nhật thành công!' })

      const index = adminReviews.value.findIndex((r) => r.id === reviewId)
      if (index !== -1) {
        if (payload.status !== undefined) adminReviews.value[index].status = payload.status // Cập nhật status string nếu BE trả về enum string hoặc map lại sau
        if (payload.adminResponse !== undefined)
          adminReviews.value[index].adminResponse = payload.adminResponse

        // Vì API trả về ReviewReadDto mới nhất, ta nên gán đè vào để chuẩn xác nhất
        // const updatedData = await reviewService.adminUpdateReview(...) -> gán res.data vào adminReviews[index]
      }

      // Hoặc đơn giản là fetch lại trang hiện tại (an toàn hơn)
      // await fetchAdminReviews(...) -> Component gọi
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại.'
      toast.show({ type: 'error', message: msg })
      return false
    } finally {
      submitting.value = false
    }
  }
  return {
    reviews,
    canReview,
    adminReviews,
    adminTotalItems,
    loading,
    submitting,
    fetchReviews,
    checkUserEligibility,
    submitReview,
    editReview,
    removeReview,
    fetchAdminReviews,
    updateReviewStatusOrReply,
  }
})
