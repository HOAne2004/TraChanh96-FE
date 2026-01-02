<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'

import CartItemList from '@/components/customer/cart/CartItemList.vue'
import CartSummaryPanel from '@/components/customer/cart/CartSummaryPanel.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue'

const cartStore = useCartStore()
const userStore = useUserStore()
const toastStore = useToastStore()
const router = useRouter()

const { carts, loading } = storeToRefs(cartStore)
const { isLoggedIn } = storeToRefs(userStore)
const activeStoreId = ref(null)

// 1. Logic chọn Tab mặc định hoặc giữ Tab khi reload
watch(
  carts,
  (newCarts) => {
    // Nếu chưa chọn tab nào và có dữ liệu -> Chọn cái đầu tiên
    if (newCarts.length > 0 && !activeStoreId.value) {
      activeStoreId.value = newCarts[0].storeId
    }
    // Nếu tab đang chọn bị xóa mất (do user xóa hết item trong đó) -> Reset về cái đầu tiên hoặc null
    if (activeStoreId.value && !newCarts.find((c) => c.storeId === activeStoreId.value)) {
      activeStoreId.value = newCarts.length > 0 ? newCarts[0].storeId : null
    }
  },
  { immediate: true, deep: true },
)

// 2. Computed
const activeCart = computed(() => {
  return carts.value.find((c) => c.storeId === activeStoreId.value)
})

const activeItems = computed(() => activeCart.value?.items || [])
const activeTotal = computed(() => activeCart.value?.totalAmount || 0)

const hasAnyItems = computed(() => carts.value.some((c) => c.items && c.items.length > 0))
const hasItemsInActiveTab = computed(() => activeItems.value && activeItems.value.length > 0)

// 3. Fetch data
onMounted(async () => {
  try {
    if (userStore.token) {
      await cartStore.fetchCart()
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu ở CartView:', error)
  }
})

// 4. Checkout Action
const checkout = () => {
  if (!hasItemsInActiveTab.value) return

  if (!isLoggedIn.value) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập trước khi thanh toán!' })
    router.push('/login')
    return
  }

  // Chuyển sang trang checkout kèm theo storeId để biết thanh toán cho giỏ nào
  router.push({
    path: '/checkout',
    query: { storeId: activeStoreId.value },
  })
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 min-h-[70vh]">
    <h1 class="text-3xl font-bold mb-8 text-green-600 dark:text-green">Giỏ hàng</h1>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>

    <div v-else>
      <div v-if="hasAnyItems" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8">
          <div
            class="flex items-end overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700"
          >
            <button
              v-for="cart in carts"
              :key="cart.storeId"
              @click="activeStoreId = cart.storeId"
              class="group relative px-6 py-3 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap mr-1 border-t border-l border-r"
              :class="
                activeStoreId === cart.storeId
                  ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border-gray-200 dark:border-gray-700 -mb-px z-10'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-500 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
              "
            >
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                  :class="activeStoreId === cart.storeId ? 'text-green-600' : 'text-gray-400'"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .415.336.75.75.75Z"
                  />
                </svg>
                <span>{{ cart.storeName }}</span>
                <span
                  class="ml-1 text-xs px-2 py-0.5 rounded-full"
                  :class="
                    activeStoreId === cart.storeId
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  "
                >
                  {{ cart.items.length }}
                </span>
              </div>
            </button>
          </div>

          <div
            class="bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 min-h-[300px] relative z-0"
          >
            <CartItemList
              :cartItems="activeItems"
              :storeId="activeStoreId"
              :loading="loading"
              @update-quantity="cartStore.updateQuantity"
              @remove-item="cartStore.removeItem"
              @clear-cart="cartStore.clearCartByStore"
            />
          </div>
        </div>

        <div class="lg:col-span-4 sticky top-24">
          <CartSummaryPanel
            :total="Number(activeTotal)"
            :hasItems="hasItemsInActiveTab"
            :isLoggedIn="isLoggedIn"
            @checkout="checkout"
          />
        </div>
      </div>

      <CustomerEmptyState
        v-else
        type="cart"
        title="Giỏ hàng trống trơn"
        message="Hãy chọn một cửa hàng và thêm món yêu thích nhé!"
        action-label="Xem thực đơn"
        action-route="/products"
      />
    </div>
  </div>
</template>
