import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import cartService from '@/services/sales/cart.service'
import { useUserStore } from '@/stores/identity/user.store'

export const useCartStore = defineStore('cart', () => {
  const carts = ref([])
  const loading = ref(false)
  const lastActiveStoreId = ref(null)

  // --- GETTERS ---
  const totalItems = computed(() => {
    return carts.value.reduce((total, cart) => {
      return total + (cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
    }, 0)
  })

  const totalPrice = computed(() => {
    return carts.value.reduce((sum, cart) => sum + (cart.totalAmount || 0), 0)
  })

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

  async function fetchCart() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      carts.value = []
      return
    }

    loading.value = true
    try {
      const res = await cartService.getMyCart()
      carts.value = res.data
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err)
    } finally {
      loading.value = false
    }
  }

  async function addToCart(payload) {
    loading.value = true
    try {
      const res = await cartService.addToCart(payload)
      carts.value = res.data
      lastActiveStoreId.value = payload.storeId
      return true
    } catch (err) {
      console.error('Lỗi thêm giỏ hàng:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return

    const item = carts.value.flatMap((c) => c.items || []).find((i) => i.id === cartItemId)
    if (!item) return

    const oldQuantity = item.quantity
    
    // Optimistic Update: Đổi số lượng trên UI trước cho mượt
    item.quantity = newQuantity

    try {
      await cartService.updateItemQuantity({
        cartItemId,
        quantity: newQuantity,
      })
    } catch (err) {
      // API BÁO LỖI VƯỢT QUÁ GIỚI HẠN -> ROLLBACK
      item.quantity = oldQuantity 
      
      console.error('Lỗi cập nhật số lượng:', err)
    }
  }

  async function removeItem(cartItemId) {
    const cart = carts.value.find((c) => c.items?.some((i) => i.id === cartItemId))
    if (!cart) return

    const oldItems = [...cart.items]
    cart.items = cart.items.filter((i) => i.id !== cartItemId)

    if (cart.items.length === 0) {
      carts.value = carts.value.filter((c) => c !== cart)
    }

    try {
      await cartService.removeItem(cartItemId)
    } catch (err) {
      cart.items = oldItems
      console.error('Lỗi xóa sản phẩm:', err)
    }
  }

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

  async function clearCartByStore(storeId) {
    const oldCarts = [...carts.value]

    carts.value = carts.value.filter((c) => c.storeId !== storeId)

    try {
      await cartService.clearCartByStore(storeId)
    } catch (err) {
      carts.value = oldCarts
      console.error(`Lỗi dọn giỏ hàng store ${storeId}:`, err)
    }
  }

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