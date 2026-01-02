import { defineStore } from 'pinia'
import { ref } from 'vue'
import reviewService from '@/services/review.service'
import { useToastStore } from '@/stores/toast'

export const useReviewStore = defineStore('review', () => {
  // --- STATE ---
  const reviews = ref([]) // Danh sách review hiện tại
  const canReview = ref(false) // User có được quyền review món này không?
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

  return {
    reviews,
    canReview,
    loading,
    submitting,
    fetchReviews,
    checkUserEligibility,
    submitReview,
    editReview,
    removeReview,
  }
})
