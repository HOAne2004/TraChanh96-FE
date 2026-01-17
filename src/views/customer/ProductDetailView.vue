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

// Utils & Constants
import { formatPrice } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'
import { SUGAR_OPTIONS, ICE_OPTIONS, SugarLevel, IceLevel } from '@/constants/enums'

// Components
import NavLink from '@/components/common/NavLink.vue'
import TitledContainer from '@/components/customer/TitledContainer.vue'
import Button from '@/components/common/Button.vue'
import DeliveryInfor from '@/components/customer/DeliveryInfor.vue' // Tạm ẩn
import StoreFilter from '@/components/customer/StoreFilter.vue'
import ReviewList from '@/components/customer/review/ReviewList.vue'

import defaultImage from '@/assets/images/others/default-drink.png'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const policyStore = usePolicyStore()
const storeStore = useStoreStore()
const sizeStore = useSizeStore()
const reviewStore = useReviewStore()

// State từ Store
const { sizes } = storeToRefs(sizeStore)
const { currentProduct, products, loading } = storeToRefs(productStore)
const { policy } = storeToRefs(policyStore)
const { canReview } = storeToRefs(reviewStore)

// Local State
const quantity = ref(1)
const selectedSize = ref(null)
const selectedSugar = ref(SugarLevel.PERCENT_100) // Mặc định 100% (ID: 100)
const selectedIce = ref(IceLevel.PERCENT_100) // Mặc định 100% (ID: 100)
const selectedToppings = ref([])
const note = ref('')
const isAdding = ref(false)
const toastStore = useToastStore()
const { stores, selectedStoreId } = storeToRefs(storeStore)

const storeStatus = computed(() => {
  const store = stores.value.find((s) => s.id === selectedStoreId.value)
  return storeStore.getStoreStatus(store) // Sử dụng hàm từ Store
})

const isActionDisabled = computed(() => {
  return isAdding.value || (selectedStoreId.value && !storeStatus.value.isOpen)
})

const isDrink = computed(() => {
  return currentProduct.value.productType.toLowerCase() === 'drink'
})

// 1. Fetch dữ liệu
const loadData = async () => {
  // Reset state cũ
  quantity.value = 1
  selectedSize.value = null
  note.value = ''

  // Gọi API lấy chi tiết
  await Promise.all([
    productStore.fetchProductBySlug(route.params.slug),
    storeStore.fetchActiveStores(),
    productStore.fetchProducts(),
    sizeStore.fetchActiveSizes(),
  ])

  // Setup mặc định sau khi có data
  if (currentProduct.value) {
    // Chọn size rẻ nhất làm mặc định
    if (isDrink.value && currentProduct.value.availableSizes?.length > 0) {
      // Sort tăng dần theo giá
      const sortedSizes = [...currentProduct.value.availableSizes].sort(
        (a, b) => (a.priceModifier || 0) - (b.priceModifier || 0),
      )
      selectedSize.value = sortedSizes[0]
    }
  }
  if (userStore.isLoggedIn) {
    await reviewStore.checkUserEligibility(currentProduct.value.id)
  }
  await reviewStore.fetchReviews(currentProduct.value.id)
}

onMounted(loadData)
// Watch ID thay đổi (trường hợp click sản phẩm gợi ý bên dưới)
watch(() => route.params.slug, loadData)

// 2. Computed Properties
// Lọc danh sách Topping từ toàn bộ sản phẩm (Giả định Type = 'Topping')
const availableToppings = computed(() => {
  if (!products.value) return []
  // Logic: Lấy các món có type là Topping VÀ (nếu đã chọn quán) thì quán đó phải có bán
  return products.value.filter((p) => {
    const isTopping =
      p.productType?.toLowerCase() === 'topping' || p.categoryName?.toLowerCase() === 'topping'

    // Nếu đã chọn quán, check xem topping này có bán ở quán đó không
    if (selectedStoreId.value && p.storeIds) {
      return isTopping && p.storeIds.includes(selectedStoreId.value)
    }
    return isTopping
  })
})
const productImage = computed(() => resolveImage(currentProduct.value?.imageUrl, defaultImage))
const handleImageError = (e) => {
  // Gán nguồn ảnh thành ảnh mặc định
  e.target.src = defaultImage
  // Ngắt sự kiện lỗi tiếp theo để tránh vòng lặp vô tận nếu ảnh default cũng lỗi
  e.target.onerror = null
}

// Tính giá cuối cùng (Giá gốc + Giá Size)
// Chưa tính topping vì chưa có module topping
const finalPrice = computed(() => {
  if (!currentProduct.value) return 0
  let price = Number(currentProduct.value.basePrice)

  if (selectedSize.value) {
    price += Number(selectedSize.value.priceModifier || 0)
  }
  if (selectedToppings.value.length > 0) {
    const toppingsTotal = selectedToppings.value.reduce((sum, t) => sum + Number(t.basePrice), 0)
    price += toppingsTotal
  }
  return price
})

const totalPrice = computed(() => finalPrice.value * quantity.value)

// 3. Actions
const increaseQty = () => {
  if (quantity.value < 100) quantity.value++
}
const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}

const toggleTopping = (topping) => {
  const index = selectedToppings.value.findIndex((t) => t.id === topping.id)
  if (index === -1) {
    selectedToppings.value.push(topping)
  } else {
    selectedToppings.value.splice(index, 1)
  }
}

const handleAddToCart = async (isBuyNow = false) => {
  if (selectedStoreId.value && !storeStatus.value.isOpen) {
    toastStore.show({ type: 'error', message: `Cửa hàng đang: ${storeStatus.value.message}` })
    return
  }
  if (!userStore.isLoggedIn) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập để đặt món!' })
    router.push('/login')
    return
  }

  if (!selectedStoreId.value) {
    toastStore.show({ type: 'warning', message: 'Vui lòng chọn cửa hàng trước!' })
    return
  }

  if (!selectedSize.value && currentProduct.value?.availableSizes?.length > 0) {
    toastStore.show({ type: 'warning', message: 'Vui lòng chọn kích cỡ!' })
    return
  }

  isAdding.value = true
  try {
    const toppingPayload = selectedToppings.value.map((t) => ({
      productId: t.id,
      quantity: 1,
    }))

    const payload = {
      storeId: selectedStoreId.value,
      productId: currentProduct.value.id,
      quantity: quantity.value,
      sizeId: selectedSize.value ? selectedSize.value.id : null,
      sugarLevelId: selectedSugar.value,
      iceLevelId: selectedIce.value,
      note: note.value,
      toppings: toppingPayload,
    }

    await cartStore.addToCart(payload)

    if (isBuyNow) {
      router.push('/checkout')
    } else {
      toastStore.show({ type: 'success', message: 'Đã thêm món vào giỏ hàng!' })
      quantity.value = 1
      selectedToppings.value = []
    }
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ.'
    toastStore.show({ type: 'error', message: msg })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <main class="container mx-auto px-4 min-h-screen">
    <div
      v-if="selectedStoreId && !storeStatus.isOpen"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <span class="font-bold">Cửa hàng hiện không nhận đơn.</span>
        <span class="ml-1">({{ storeStatus.message }})</span>
      </div>
    </div>
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p>Đang tải chi tiết món...</p>
    </div>

    <div v-else-if="currentProduct" class="animate-fade-in">
      <div class="mb-6 text-sm text-gray-500 flex items-center gap-2">
        <NavLink to="/products" label="Sản phẩm" variant="secondary" />
        <span>/</span>
        <span class="font-semibold text-gray-800 dark:text-gray-200">{{
          currentProduct.name
        }}</span>
      </div>

      <div class="w-full grid grid-cols-[4fr_6fr] gap-10 lg:gap-16">
        <div class="space-y-4">
          <div
            class="aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative group"
          >
            <img
              :src="productImage"
              :alt="currentProduct.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error="handleImageError"
            />
            <div
              class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-500 shadow-md flex items-center gap-1"
            >
              <span>{{ currentProduct.totalRating || 5.0 }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-3 h-3"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <StoreFilter :stores="stores" v-model="selectedStoreId" />
        </div>

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



          <div v-if="isDrink" class="space-y-6 mb-8">
            <hr class="border-gray-200 dark:border-gray-700 mb-6" />
            <div v-if="sizes?.length > 0">
              <span class="block text-sm font-semibold mb-2">Kích cỡ</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="size in sizes"
                  :key="size.id"
                  @click="selectedSize = size"
                  class="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                  :class="
                    selectedSize?.id === size.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500'
                  "
                >
                  {{ size.label }}
                  <span v-if="size.priceModifier > 0" class="text-xs ml-1 text-gray-500">
                    (+{{ formatPrice(size.priceModifier) }})
                  </span>
                </button>
              </div>
            </div>

            <div>
              <span class="block text-sm font-semibold mb-2">Độ ngọt</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="level in SUGAR_OPTIONS"
                  :key="level.id"
                  @click="selectedSugar = level.id"
                  :class="[
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    selectedSugar === level.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500',
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <div>
              <span class="block text-sm font-semibold mb-2">Lượng đá</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="level in ICE_OPTIONS"
                  :key="level.id"
                  @click="selectedIce = level.id"
                  :class="[
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    selectedIce === level.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500',
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <div v-if="availableToppings.length > 0">
              <span class="block text-sm font-semibold mb-2">Thêm Topping</span>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="t in availableToppings"
                  :key="t.id"
                  @click="toggleTopping(t)"
                  class="flex items-center p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm"
                  :class="
                    selectedToppings.some((s) => s.id === t.id)
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  "
                >
                  <div class="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                    <img
                      :src="resolveImage(t.imageUrl, defaultImage)"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ t.name }}</p>
                    <p class="text-xs text-gray-500">+{{ formatPrice(t.basePrice) }}</p>
                  </div>
                  <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center"
                    :class="
                      selectedToppings.some((s) => s.id === t.id)
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300'
                    "
                  >
                    <svg
                      v-if="selectedToppings.some((s) => s.id === t.id)"
                      class="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t dark:border-gray-700 flex flex-col gap-4 items-center">
            <div class="w-full flex gap-10 items-center">
              <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  @click="decreaseQty"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  -
                </button>
                <span class="px-4 font-bold min-w-[3rem] text-center">{{ quantity }}</span>
                <button
                  @click="increaseQty"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  +
                </button>
              </div>

              <div class="flex-1 text-center sm:text-left">
                <span class="block text-xs text-gray-500">Tạm tính</span>
                <span class="text-2xl font-bold text-green-700">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
            <div class="w-full">
              <label class="block font-bold text-gray-700 dark:text-gray-200 mb-2"
                >Ghi chú món:</label
              >
              <textarea
                v-model="note"
                rows="2"
                placeholder="Ví dụ: Ít ngọt, nhiều trân châu..."
                class="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none transition-shadow"
              ></textarea>
            </div>
            <div v-if="selectedStoreId" class="w-full flex gap-10 items-center">
              <Button
                :label="
                  isAdding
                    ? 'Đang xử lý...'
                    : storeStatus.isOpen
                      ? 'Thêm vào giỏ'
                      : 'Ngừng nhận đơn'
                "
                class="flex-1 rounded-full text-lg shadow-lg shadow-green-200 dark:shadow-none h-12"
                variant="outline"
                :disabled="isActionDisabled"
                @click="handleAddToCart(false)"
              >
                <template #icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </template>
              </Button>

              <Button
                :label="isAdding ? '...' : storeStatus.isOpen ? 'Mua ngay' : 'Đóng cửa'"
                class="flex-1 rounded-full text-lg shadow-lg shadow-green-200 dark:shadow-none h-12"
                variant="primary"
                :disabled="isActionDisabled"
                @click="handleAddToCart(true)"
              />

            </div>
            <div v-if="!selectedStoreId" class="w-full flex gap-10 items-center">
              <Button
                label="Hãy chọn một cửa hàng"
                class="flex-1 rounded-full text-lg shadow-lg shadow-green-200 dark:shadow-none h-12"
                variant="primary"
                :disabled="true"
              />
            </div>
          </div>
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
      <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
        Sản phẩm không tồn tại
      </h3>
      <p class="text-gray-500 mb-6">Có thể sản phẩm đã bị xóa hoặc đường dẫn không đúng.</p>
      <Button label="Xem thực đơn" @click="router.push('/products')" />
    </div>

    <div
      v-if="canReview"
      class="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between"
    >
      <span class="text-green-800 text-sm font-medium">Bạn đã mua sản phẩm này?</span>
      <router-link to="/profile/orders" class="text-green-600 font-bold hover:underline text-sm">
        Viết đánh giá trong Đơn hàng
      </router-link>
    </div>
    <div id="reviews-section" class="mt-12">
      <ReviewList :reviews="reviewStore.reviews" />
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
