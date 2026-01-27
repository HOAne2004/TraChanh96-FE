// src/stores/cart.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import cartService from '@/services/cart.service'
import { useUserStore } from '@/stores/user'

export const useCartStore = defineStore('cart', () => {
  // --- STATE ---
  const carts = ref([])
  const loading = ref(false)
  const lastActiveStoreId = ref(null)
  // --- GETTERS ---

  const totalItems = computed(() => {
    return carts.value.reduce((total, cart) => {
      return total + (cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
    }, 0)
  })

  // Tổng tiền (Lấy trực tiếp từ BE tính toán sẵn)
  const totalPrice = computed(() => {
    return carts.value.reduce((sum, cart) => sum + (cart.totalAmount || 0), 0)
  })

  // Danh sách items
  const cartItems = computed(() =>
    carts.value.flatMap((cart) =>
      (cart.items || []).map((item) => ({
        ...item,
        storeId: cart.storeId,
        storeName: cart.storeName,
      })),
    ),
  )
  // --- ACTIONS ---

  /**
   * Lấy giỏ hàng từ API
   */
  async function fetchCart() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      carts.value = []
      return
    }

    loading.value = true
    try {
      const res = await cartService.getMyCart()
      carts.value = res.data // 🟢 API trả về mảng
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Thêm vào giỏ
   * @param {Object} payload - Khớp CartItemCreateDto
   * { productId, quantity, sizeId, sugarLevelId, iceLevelId, note, toppings: [] }
   */
  async function addToCart(payload) {
    loading.value = true
    try {
      const res = await cartService.addToCart(payload)
      carts.value = res.data
      lastActiveStoreId.value = payload.storeId
      return true
    } catch (err) {
      console.error('Lỗi thêm giỏ hàng:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cập nhật số lượng
   * @param {Number} cartItemId
   * @param {Number} newQuantity
   */
  async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return

    const item = carts.value.flatMap((c) => c.items || []).find((i) => i.id === cartItemId)

    if (!item) return

    const oldQuantity = item.quantity
    item.quantity = newQuantity

    try {
      await cartService.updateItemQuantity({
        cartItemId,
        quantity: newQuantity,
      })
    } catch (err) {
      // Rollback
      item.quantity = oldQuantity
      console.error('Lỗi cập nhật số lượng:', err)
    }
  }

  /**
   * Xóa sản phẩm
   */
  async function removeItem(cartItemId) {
    // 1. Tìm cart chứa item
    const cart = carts.value.find((c) => c.items?.some((i) => i.id === cartItemId))
    if (!cart) return

    // 2. Optimistic update
    const oldItems = [...cart.items]
    cart.items = cart.items.filter((i) => i.id !== cartItemId)

    // Nếu cart trống → xóa luôn cart
    if (cart.items.length === 0) {
      carts.value = carts.value.filter((c) => c !== cart)
    }

    try {
      await cartService.removeItem(cartItemId)
    } catch (err) {
      // Rollback nếu API fail
      cart.items = oldItems
      console.error('Lỗi xóa sản phẩm:', err)
    }
  }

  /**
   * Xóa hết giỏ
   */
  async function clearCart() {
    loading.value = true
    try {
      const res = await cartService.clearCart()
      carts.value = res.data
    } catch (err) {
      console.error('Lỗi dọn giỏ hàng:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Xóa hết giỏ theo store
   */
  async function clearCartByStore(storeId) {
    const oldCarts = [...carts.value]

    // Optimistic
    carts.value = carts.value.filter((c) => c.storeId !== storeId)

    try {
      await cartService.clearCartByStore(storeId)
    } catch (err) {
      // Rollback
      carts.value = oldCarts
      console.error(`Lỗi dọn giỏ hàng store ${storeId}:`, err)
    }
  }

  // Reset state khi logout
  function reset() {
    carts.value = []
  }

  return {
    carts,
    lastActiveStoreId,
    loading,
    totalItems,
    totalPrice,
    cartItems,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearCartByStore,
    reset,
  }
})
