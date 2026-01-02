import { defineStore } from 'pinia'
import { ref } from 'vue'
import newsService from '@/services/news.service'

export const useNewsStore = defineStore('news', () => {
  // --- STATE ---
  const newsList = ref([])            // Admin list
  const publishedNews = ref([])       // Public list
  const currentNews = ref(null)       // Chi tiết bài
  const carousel = ref([])

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

  async function fetchAllNewsAdmin({ search = null, status = null } = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await newsService.getAllAdmin({ search, status })
      newsList.value = res.data
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
