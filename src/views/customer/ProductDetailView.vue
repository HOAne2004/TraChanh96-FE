<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Stores
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useStoreStore } from '@/stores/store'
import { useUserStore } from '@/stores/user'
import { usePolicyStore } from '@/stores/policy'
import { useToastStore } from '@/stores/toast'
import { useSizeStore } from '@/stores/size'
import { useReviewStore } from '@/stores/review'

// Constants
import { SugarLevel, IceLevel } from '@/constants/enums'
import { formatPrice } from '@/utils/formatters'

// Components
import NavLink from '@/components/common/NavLink.vue'
import TitledContainer from '@/components/customer/TitledContainer.vue'
import DeliveryInfor from '@/components/customer/DeliveryInfor.vue'
import ReviewList from '@/components/customer/review/ReviewList.vue'
import Button from '@/components/common/Button.vue'

// Refactored Components
import ProductGallery from '@/components/customer/product-detail/ProductGallery.vue'
import ProductSelectors from '@/components/customer/product-detail/ProductSelectors.vue'
import ProductActions from '@/components/customer/product-detail/ProductActions.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const policyStore = usePolicyStore()
const storeStore = useStoreStore()
const sizeStore = useSizeStore()
const reviewStore = useReviewStore()
const toastStore = useToastStore()

const { sizes } = storeToRefs(sizeStore)
const { currentProduct, products, loading } = storeToRefs(productStore)
const { policy } = storeToRefs(policyStore)
const { canReview } = storeToRefs(reviewStore)
const { stores, selectedStoreId, storeMenu } = storeToRefs(storeStore)

// Local State
const quantity = ref(1)
const selectedSize = ref(null)
const selectedSugar = ref(SugarLevel.PERCENT_100)
const selectedIce = ref(IceLevel.PERCENT_100)
const selectedToppings = ref([])
const note = ref('')
const isAdding = ref(false)

// --- COMPUTED LOGIC ---

// 1. Check Store Availability
const isAvailableAtStore = computed(() => {
  if (!selectedStoreId.value) return true
  if (storeMenu.value.length > 0) {
    // Check cả ID (User) lẫn ProductId (Admin) để an toàn
    const itemInStore = storeMenu.value.find(p => p.id === currentProduct.value.id || p.productId === currentProduct.value.id)
    return !!itemInStore
  }
  return true
})

const storeStatus = computed(() => {
  if (!selectedStoreId.value) return { isOpen: true }
  const store = stores.value.find((s) => s.id === selectedStoreId.value)
  return storeStore.getStoreStatus(store)
})

const isActionDisabled = computed(() => {
  return isAdding.value ||
         (selectedStoreId.value && !storeStatus.value.isOpen) ||
         !isAvailableAtStore.value
})

const isDrink = computed(() => currentProduct.value.productType?.toLowerCase() === 'drink')

const isSoldOut = computed(() => {
  if (!selectedStoreId.value) return false

  if (storeMenu.value.length > 0) {
    const item = storeMenu.value.find(p => p.id === currentProduct.value.id || p.productId === currentProduct.value.id)
    // Nếu tìm thấy item trong menu nhưng có cờ isSoldOut hoặc status OutOfStock
    if (item && (item.isSoldOut || item.storeStatus === 'OutOfStock')) {
        return true
    }
  }
  return false
})

// 2. Filter Toppings
const availableToppings = computed(() => {
  if (!products.value) return []
  return products.value.filter((p) => {
    const isTopping = p.productType?.toLowerCase() === 'topping' || p.categoryName?.toLowerCase() === 'topping'
    if (selectedStoreId.value && p.storeIds) {
      return isTopping && p.storeIds.includes(selectedStoreId.value)
    }
    return isTopping
  })
})

// 3. Price Calculation
const finalPrice = computed(() => {
  if (!currentProduct.value) return 0
  let price = Number(currentProduct.value.basePrice)
  if (selectedSize.value) price += Number(selectedSize.value.priceModifier || 0)
  if (selectedToppings.value.length > 0) {
    const toppingsTotal = selectedToppings.value.reduce((sum, t) => sum + Number(t.basePrice), 0)
    price += toppingsTotal
  }
  return price
})

const totalPrice = computed(() => finalPrice.value * quantity.value)

// --- ACTIONS ---

const loadData = async () => {
  quantity.value = 1
  selectedSize.value = null
  note.value = ''
  selectedToppings.value = []

  await Promise.all([
    productStore.fetchProductBySlug(route.params.slug),
    storeStore.fetchActiveStores(),
    productStore.fetchProducts(),
    sizeStore.fetchActiveSizes(),
  ])

  if (currentProduct.value) {
    // Auto select menu if store selected
    if (selectedStoreId.value) {
        await storeStore.fetchStoreMenu(selectedStoreId.value)
    }

    if (isDrink.value && currentProduct.value.availableSizes?.length > 0) {
      const sortedSizes = [...currentProduct.value.availableSizes].sort((a, b) => (a.priceModifier || 0) - (b.priceModifier || 0))
      selectedSize.value = sortedSizes[0]
    }
    await reviewStore.fetchReviews(currentProduct.value.id)
    if (userStore.isLoggedIn) {
      await reviewStore.checkUserEligibility(currentProduct.value.id)
    }
  }
}

onMounted(loadData)
watch(() => route.params.slug, loadData)
// Watch store change to fetch menu logic for validation
watch(selectedStoreId, async (newId) => {
    if(newId) await storeStore.fetchStoreMenu(newId)
})

const toggleTopping = (topping) => {
  const index = selectedToppings.value.findIndex((t) => t.id === topping.id)
  if (index === -1) selectedToppings.value.push(topping)
  else selectedToppings.value.splice(index, 1)
}

const handleAddToCart = async (isBuyNow = false) => {
  // Logic validate giữ nguyên
  if (selectedStoreId.value && !storeStatus.value.isOpen) {
    return toastStore.show({ type: 'error', message: `Cửa hàng đang: ${storeStatus.value.message}` })
  }
  if (!userStore.isLoggedIn) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập để đặt món!' })
    return router.push('/login')
  }
  if (!selectedStoreId.value) return toastStore.show({ type: 'warning', message: 'Vui lòng chọn cửa hàng trước!' })
  if (!isAvailableAtStore.value) return toastStore.show({ type: 'error', message: 'Sản phẩm này không phục vụ tại cửa hàng đã chọn.' })

  // Double check storeIds (Optional)
  const productStoreIds = currentProduct.value?.storeIds
  if (productStoreIds?.length && !productStoreIds.includes(selectedStoreId.value)) {
    return toastStore.show({ type: 'error', message: 'Sản phẩm này hiện không bán tại cửa hàng đã chọn' })
  }

  if (!selectedSize.value && currentProduct.value?.availableSizes?.length > 0) {
    return toastStore.show({ type: 'warning', message: 'Vui lòng chọn kích cỡ!' })
  }

  isAdding.value = true
  try {
    const payload = {
      storeId: selectedStoreId.value,
      productId: currentProduct.value.id,
      quantity: quantity.value,
      sizeId: selectedSize.value?.id ?? null,
      sugarLevelId: selectedSugar.value,
      iceLevelId: selectedIce.value,
      note: note.value,
      toppings: selectedToppings.value.map((t) => ({ productId: t.id, quantity: 1 })),
    }

    await cartStore.addToCart(payload)

    if (isBuyNow) {
      router.push({ path: '/checkout', query: { storeId: selectedStoreId.value } })
    } else {
      toastStore.show({ type: 'success', message: 'Đã thêm món vào giỏ hàng!' })
      quantity.value = 1
      selectedToppings.value = []
      note.value = ''
    }
  } catch (err) {
    toastStore.show({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra.' })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <main class="container mx-auto px-4 min-h-screen">
    <div v-if="selectedStoreId && !storeStatus.isOpen" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div><span class="font-bold">Cửa hàng hiện không nhận đơn.</span> <span class="ml-1">({{ storeStatus.message }})</span></div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p>Đang tải chi tiết món...</p>
    </div>

    <div v-else-if="currentProduct" class="animate-fade-in">
      <div class="mb-6 text-sm text-gray-500 flex items-center gap-2">
        <NavLink to="/products" label="Sản phẩm" variant="secondary" />
        <span>/</span>
        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ currentProduct.name }}</span>
      </div>

      <div class="w-full grid grid-cols-1 md:grid-cols-[4fr_6fr] gap-10 lg:gap-16">
        <ProductGallery
          :product="currentProduct"
          :stores="stores"
          v-model:selectedStoreId="selectedStoreId"
        />

        <div class="space-y-4">
          <span class="text-green-600 font-medium tracking-wide uppercase text-sm mb-2">
            {{ currentProduct.categoryName || 'Đồ uống' }}
          </span>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {{ currentProduct.name }}
          </h1>
          <div class="text-3xl font-extrabold text-primary mb-6">
            {{ formatPrice(finalPrice) }}đ
          </div>

          <ProductSelectors
            :is-drink="isDrink"
            :sizes="sizes"
            :available-toppings="availableToppings"
            v-model:selected-size="selectedSize"
            v-model:selected-sugar="selectedSugar"
            v-model:selected-ice="selectedIce"
            :selected-toppings="selectedToppings"
            @toggle-topping="toggleTopping"
          />

          <ProductActions
            v-model:quantity="quantity"
            v-model:note="note"
            :total-price="totalPrice"
            :is-adding="isAdding"
            :store-status="storeStatus"
            :is-disabled="isActionDisabled || isSoldOut"
            :has-selected-store="!!selectedStoreId"
            :is-available-at-store="isAvailableAtStore"
            :is-sold-out="isSoldOut"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>

      <div class="mt-12">
        <TitledContainer title="Mô tả sản phẩm" controls="hidden">
          <div class="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>{{ currentProduct.description || 'Đang cập nhật mô tả...' }}</p>
          </div>
        </TitledContainer>
        <DeliveryInfor v-if="policy" :policy="policy" class="mt-8" />
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Sản phẩm không tồn tại</h3>
      <Button label="Xem thực đơn" @click="router.push('/products')" />
    </div>

    <div v-if="canReview" class="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
      <span class="text-green-800 text-sm font-medium">Bạn đã mua sản phẩm này?</span>
      <router-link to="/profile/orders" class="text-green-600 font-bold hover:underline text-sm">Viết đánh giá trong Đơn hàng</router-link>
    </div>
    <div id="reviews-section" class="mt-12">
      <ReviewList :reviews="reviewStore.reviews" />
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
