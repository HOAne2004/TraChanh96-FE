// src/stores/pos.js
import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import orderService from '@/services/order.service'
import { ORDER_TYPE } from '@/constants/order.constants'

export const usePosStore = defineStore('pos', () => {
  /* ------------------------------------------------------------------
   * STATE
   * ------------------------------------------------------------------ */

  /**
   * cartItems structure:
   * {
   *   productId,
   *   productName,
   *   quantity,
   *   unitPrice,
   *   options: { sizeId, sugarLevelId, iceLevelId },
   *   note
   * }
   */
  const cartItems = ref([])

  const selectedCategory = ref(null)
  const searchQuery = ref('')

  // Mặc định: Bán tại quầy
  const orderType = ref(ORDER_TYPE.AT_COUNTER)

  // Chỉ dùng khi nghiệp vụ yêu cầu (VD: tại bàn)
  const selectedTableId = ref(null)

  /* ------------------------------------------------------------------
   * GETTERS
   * ------------------------------------------------------------------ */

  const totalItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

  const subTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  )

  const totalAmount = computed(() => subTotal.value)

  const isEmpty = computed(() => cartItems.value.length === 0)

  /* ------------------------------------------------------------------
   * HELPERS (PRIVATE)
   * ------------------------------------------------------------------ */

  // const isSameCartItem = (a, b) => {
  //   return (
  //     a.productId === b.productId &&
  //     a.options?.sizeId === b.options?.sizeId &&
  //     a.options?.sugarLevelId === b.options?.sugarLevelId &&
  //     a.options?.iceLevelId === b.options?.iceLevelId &&
  //     (a.note || '').trim() === (b.note || '').trim()
  //   )
  // }

  /* ------------------------------------------------------------------
   * ACTIONS
   * ------------------------------------------------------------------ */

  /**
   * Add item to POS cart
   * @param {Object} item
   */
  function addToCart(item) {
    if (!item || !item.product) {
      console.warn('[POS] Invalid item:', item)
      return
    }

    // ✅ UNWRAP REACTIVE OBJECT
    const product = toRaw(item.product)
    const options = toRaw(item.options || {})

    if (
      typeof product.id !== 'number' ||
      typeof item.quantity !== 'number' ||
      typeof item.unitPrice !== 'number'
    ) {
      console.warn('[POS] Invalid item shape:', item)
      return
    }

    const existingIndex = cartItems.value.findIndex((existing) => {
      return (
        existing.product.id === product.id &&
        existing.options.sizeId === options.sizeId &&
        existing.options.sugar === options.sugar &&
        existing.options.ice === options.ice &&
        (existing.note || '').trim() === (item.note || '').trim()
      )
    })

    if (existingIndex !== -1) {
      cartItems.value[existingIndex].quantity += item.quantity
      return
    }

    cartItems.value.push({
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      options: {
        sizeId: options.sizeId ?? null,
        sizeLabel: options.sizeLabel ?? '',
        sugar: options.sugar ?? null,
        ice: options.ice ?? null,
      },
      note: item.note || '',
    })
  }

  function updateQuantity(index, newQuantity) {
    if (!cartItems.value[index]) return

    if (newQuantity <= 0) {
      removeFromCart(index)
    } else {
      cartItems.value[index].quantity = newQuantity
    }
  }

  function removeFromCart(index) {
    if (!cartItems.value[index]) return
    cartItems.value.splice(index, 1)
  }

  function clearCart() {
    cartItems.value = []
    searchQuery.value = ''
    selectedCategory.value = null
    orderType.value = ORDER_TYPE.AT_COUNTER
    selectedTableId.value = null
  }

  /**
   * Checkout – submit order at counter
   * @param {Object} paymentInfo
   */
  async function checkout(paymentInfo) {
    if (isEmpty.value) {
      throw new Error('Giỏ hàng trống')
    }

    if (!paymentInfo?.paymentMethodId) {
      throw new Error('Chưa chọn phương thức thanh toán')
    }

    if (!paymentInfo?.storeId) {
      throw new Error('Thiếu thông tin cửa hàng')
    }

    const payload = {
      storeId: paymentInfo.storeId,
      paymentMethodId: paymentInfo.paymentMethodId,
      userNotes: paymentInfo.note || '',

      orderType: orderType.value,
      tableId: orderType.value === ORDER_TYPE.AT_COUNTER ? selectedTableId.value : null,

      items: cartItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        sizeId: item.options.sizeId,
        sugarLevelId: item.options.sugarLevelId,
        iceLevelId: item.options.iceLevelId,
        note: item.note,
      })),
    }

    try {
      const { data } = await orderService.createAtCounter(payload)
      clearCart()
      return data
    } catch (err) {
      console.error('[POS] Checkout failed:', err)
      throw err
    }
  }

  /* ------------------------------------------------------------------
   * PUBLIC API
   * ------------------------------------------------------------------ */

  return {
    // state
    cartItems,
    selectedCategory,
    searchQuery,
    orderType,
    selectedTableId,

    // getters
    totalItems,
    subTotal,
    totalAmount,
    isEmpty,

    // actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
  }
})
