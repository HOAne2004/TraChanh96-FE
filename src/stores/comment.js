import { defineStore } from 'pinia'
import { ref } from 'vue'
import commentService from '@/services/comment.service'
import { useToastStore } from '@/stores/toast'

export const useCommentStore = defineStore('comment', () => {
  // --- STATE ---
  const comments = ref([])
  const loading = ref(false)
  const toast = useToastStore()

  // --- HELPER: Đệ quy tìm và update Like trong cây comment ---
  const recursiveToggleLike = (list, commentId) => {
    for (let comment of list) {
      if (comment.id === commentId) {
        // Đảo ngược trạng thái hiện tại
        const isLikedOld = comment.isLiked

        // Cập nhật UI ngay lập tức
        comment.isLiked = !isLikedOld
        comment.likeCount += !isLikedOld ? 1 : -1

        return true // Đã tìm thấy và update xong
      }

      // Nếu có trả lời con, tìm tiếp trong con
      if (comment.replies && comment.replies.length > 0) {
        if (recursiveToggleLike(comment.replies, commentId)) return true
      }
    }
    return false
  }

  // --- ACTIONS ---

  // 1. Lấy danh sách bình luận
  async function fetchComments(newsId) {
    loading.value = true
    try {
      const res = await commentService.getByNewsId(newsId)
      comments.value = res.data || []
    } catch (err) {
      console.error('Lỗi tải bình luận:', err)
    } finally {
      loading.value = false
    }
  }

  // 2. Gửi bình luận
  async function addComment(payload) {
    // Không set loading toàn trang để tránh nháy, có thể xử lý loading cục bộ ở component
    try {
      await commentService.create(payload)
      toast.show({ type: 'success', message: 'Đã gửi bình luận!' })

      // Refresh lại list để hiện comment mới đúng vị trí
      await fetchComments(payload.newsId)
      return true
    } catch (err) {
      const msg = err.response?.data?.message || 'Gửi thất bại'
      toast.show({ type: 'error', message: msg })
      return false
    }
  }

  // 3. Xóa bình luận
  async function deleteComment(commentId, newsId) {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return

    try {
      await commentService.delete(commentId)
      toast.show({ type: 'success', message: 'Đã xóa bình luận.' })
      await fetchComments(newsId)
    } catch (err) {
      toast.show({ type: 'error', message: 'Xóa thất bại.' })
    }
  }

  // 4. Thả tim (Toggle Like)
  async function toggleLike(commentId) {
    // Cập nhật UI trước (Optimistic Update)
    const found = recursiveToggleLike(comments.value, commentId)

    if (!found) return

    try {
      // Gọi API nền
      await commentService.toggleLike(commentId)
    } catch (err) {
      // Nếu lỗi API -> Hoàn tác lại UI (Đảo ngược lại lần nữa)
      recursiveToggleLike(comments.value, commentId)

      // Thông báo lỗi nhẹ (hoặc silent fail tùy UX)
      if (err.response?.status === 401) {
         toast.show({ type: 'error', message: 'Vui lòng đăng nhập để thích bình luận.' })
      } else {
         console.error('Like failed', err)
      }
    }
  }

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
    toggleLike // Export action mới
  }
})
