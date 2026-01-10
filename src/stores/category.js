// src/stores/category.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import categoryService from '@/services/category.service'

export const useCategoryStore = defineStore('category', () => {
  // --- STATE ---
  const categories = ref([]) // Danh sách gốc (thường là cấu trúc cây nếu BE trả về cây)
  const loading = ref(false)
  const error = ref(null)

  // --- COMPUTED ---

  /**
   * Getter: Làm phẳng danh sách danh mục (Dùng cho Dropdown chọn Parent trong Admin)
   * Nếu API trả về dạng cây (có Children), hàm này sẽ duỗi nó ra.
   */
 const flatCategories = computed(() => {
  // Hàm sắp xếp mảng theo thứ tự tăng dần
  const sortByOrder = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)

  const flatten = (items, prefix = '') => {
    let result = []

    // 🛠️ BƯỚC 1: Sắp xếp danh sách hiện tại trước khi duyệt
    const sortedItems = [...items].sort(sortByOrder)

    sortedItems.forEach((cat) => {
      const item = { ...cat, displayName: prefix + cat.name }
      result.push(item)

      if (cat.children && cat.children.length > 0) {
        // 🛠️ BƯỚC 2: Gọi đệ quy cũng sẽ áp dụng sắp xếp cho cấp con
        result = result.concat(flatten(cat.children, prefix + '-- '))
      }
    })
    return result
  }

  // Xử lý mảng gốc nếu có dữ liệu
  return categories.value ? flatten(categories.value) : []
})

  // --- ACTIONS ---

  /**
   * Lấy danh sách danh mục
   */
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.getAll()
      categories.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh mục'
    } finally {
      loading.value = false
    }
  }

  /**
   * Tạo danh mục mới
   */
  async function createCategoryAction(createDto) {
    loading.value = true
    error.value = null
    try {
      await categoryService.create(createDto)
      // Tạo xong thì load lại danh sách để cập nhật cấu trúc cây
      await fetchCategories()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo danh mục thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật danh mục
   */
  async function updateCategoryAction(id, updateDto) {
    loading.value = true
    error.value = null
    try {
      await categoryService.update(id, updateDto)
      // Cập nhật xong cũng nên load lại để đảm bảo tính nhất quán (VD: đổi cha con)
      await fetchCategories()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa danh mục
   */
  async function deleteCategoryAction(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return

    loading.value = true
    error.value = null
    try {
      await categoryService.delete(id)
      await fetchCategories() // Load lại danh sách
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Xóa thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    flatCategories, // Dùng cái này cho <select> option
    loading,
    error,
    fetchCategories,
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
  }
})
