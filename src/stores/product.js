// src/stores/product.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import productService from '@/services/product.service'
import sizeService from '@/services/size.service'
import categoryService from '@/services/category.service'
import { useToastStore } from '@/stores/toast'
import { SUGAR_OPTIONS, ICE_OPTIONS } from '@/constants/enums'

export const useProductStore = defineStore('product', () => {
  // --- STATE ---
  const products = ref([])
  const sizes = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const categories = ref([])

  const sugarLevels = SUGAR_OPTIONS
  const iceLevels = ICE_OPTIONS

  const pagination = ref({
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  })
  // --- GETTERS ---
  const activeProducts = computed(() =>
    products.value.filter((p) => p.status === 'Active' || p.status === 'Đang hoạt động'),
  )

  // --- GETTERS (LOGIC MỚI) ---

  // 1. Top 10 Bán chạy (HOT)
  const bestSellingProducts = computed(() => {
    return [...products.value].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 10)
  })

  // 2. Top 10 Mới nhất (NEW)
  const newestProducts = computed(() => {
    return [...products.value]
      .sort(
        (a, b) =>
          new Date(b.launchDateTime || b.createdAt) - new Date(a.launchDateTime || a.createdAt),
      )
      .slice(0, 10)
  })

  // --- ACTIONS ---

  async function fetchProducts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const [productRes, sizeRes, categoriesRes] = await Promise.all([
        productService.getAll(filters),
        sizeService.getAll(),
        categoryService.getAll(),
      ])
      products.value = productRes.data.items || []
      pagination.value = {
        pageIndex: productRes.data.pageIndex,
        pageSize: productRes.data.pageSize,
        totalRecords: productRes.data.totalRecords,
        totalPages: Math.ceil(productRes.data.totalRecords / productRes.data.pageSize),
      }
      sizes.value = sizeRes.data
      categories.value = categoriesRes.data
      return productRes.data
    } catch (err) {
      console.error(err)
      error.value = 'Không thể tải danh sách sản phẩm'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchProductBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      const res = await productService.getBySlug(slug)
      currentProduct.value = res.data
    } catch (err) {
      currentProduct.value = null
      error.value = 'Sản phẩm không tồn tại'
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id) {
    loading.value = true
    error.value = null
    try {
      const res = await productService.getById(id)
      currentProduct.value = res.data
    } catch (err) {
      error.value = 'Không thể tải sản phẩm'
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo sản phẩm
   */
  async function createProduct(payload) {
    const toast = useToastStore()
    loading.value = true
    error.value = null

    try {
      const res = await productService.create(payload)
      products.value.unshift(res.data)

      toast.show({
        type: 'success',
        message: 'Thêm sản phẩm thành công',
      })

      return res.data
    } catch (err) {
      const message = err.response?.data?.message || 'Thêm sản phẩm thất bại'
      error.value = message

      toast.show({
        type: 'error',
        message,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Cập nhật sản phẩm
   */
  async function updateProduct(id, payload) {
    const toast = useToastStore()
    loading.value = true
    error.value = null

    try {
      const res = await productService.update(id, payload)

      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = res.data
      }

      if (currentProduct.value?.id === id) {
        currentProduct.value = res.data
      }

      toast.show({
        type: 'success',
        message: 'Cập nhật sản phẩm thành công',
      })

      return true
    } catch (err) {
      const message = err.response?.data?.message || 'Cập nhật sản phẩm thất bại'
      error.value = message

      toast.show({
        type: 'error',
        message,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Xóa sản phẩm
   */
  async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

    const toast = useToastStore()
    loading.value = true
    error.value = null

    try {
      await productService.delete(id)
      products.value = products.value.filter((p) => p.id !== id)

      toast.show({
        type: 'success',
        message: 'Xóa sản phẩm thành công',
      })
    } catch (err) {
      const message =
        err.response?.data?.message || 'Không thể xóa sản phẩm (có thể do ràng buộc dữ liệu)'
      error.value = message

      toast.show({
        type: 'error',
        message,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  // --- HELPER FUNCTIONS (Để ProductCard dùng) ---
  // Kiểm tra 1 sản phẩm có nằm trong top bán chạy không
  function checkIsBestSeller(productId) {
    return bestSellingProducts.value.some((p) => p.id === productId)
  }

  // Kiểm tra 1 sản phẩm có nằm trong top mới không
  function checkIsNew(productId) {
    return newestProducts.value.some((p) => p.id === productId)
  }
  return {
    products,
    pagination,
    sizes,
    currentProduct,
    loading,
    error,
    categories,
    sugarLevels,
    iceLevels,
    activeProducts,
    fetchProducts,
    bestSellingProducts,
    newestProducts,
    checkIsBestSeller,
    checkIsNew,
    fetchProductBySlug,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
