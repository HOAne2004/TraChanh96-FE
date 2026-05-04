import { defineStore } from 'pinia'
import { ref } from 'vue'
import newsService from '@/services/marketing/news.service'

export const useNewsStore = defineStore('news', () => {
  // --- STATE ---
  const newsList = ref([]) // Admin list
  const publishedNews = ref([]) // Public list
  const currentNews = ref(null) // Chi tiết bài
  const carousel = ref([])
  const pagination = ref(null) // Pagination state

  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS (PUBLIC) ---

  async function fetchCarousel() {
    try {
      const res = await newsService.getCarousel()
      carousel.value = res.data
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchPublishedNews() {
    loading.value = true
    error.value = null
    try {
      const res = await newsService.getPublished()
      publishedNews.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải bài viết'
    } finally {
      loading.value = false
    }
  }

  async function fetchNewsBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      const res = await newsService.getBySlug(slug)
      currentNews.value = res.data
    } catch (err) {
      error.value = err.response?.data || 'Không tìm thấy bài viết'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- ACTIONS (ADMIN) ---

  async function fetchAllNewsAdmin(params = { pageIndex: 1, pageSize: 10, keyword: '', status: '' }) {
    loading.value = true
    error.value = null
    try {
      const res = await newsService.getAllAdmin(params)
      // Dữ liệu API trả về định dạng phân trang
      newsList.value = res.data.items || []
      pagination.value = {
        pageIndex: res.data.pageIndex,
        pageSize: res.data.pageSize,
        totalCount: res.data.totalCount
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi tải danh sách bài viết'
    } finally {
      loading.value = false
    }
  }

  async function createNews(createDto) {
    loading.value = true
    error.value = null
    try {
      await newsService.create(createDto)
      await fetchAllNewsAdmin()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo bài viết thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateNews(id, updateDto) {
    loading.value = true
    error.value = null
    try {
      await newsService.update(id, updateDto)
      await fetchAllNewsAdmin()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteNews(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return

    loading.value = true
    error.value = null
    try {
      await newsService.delete(id)
      await fetchAllNewsAdmin()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    newsList,
    publishedNews,
    currentNews,
    carousel,
    pagination,
    loading,
    error,

    // actions
    fetchCarousel,
    fetchPublishedNews,
    fetchNewsBySlug,
    fetchAllNewsAdmin,
    createNews,
    updateNews,
    deleteNews,
  }
})
