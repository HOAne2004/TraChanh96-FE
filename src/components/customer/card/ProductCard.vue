<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart' // Check lại tên file store cart của bạn
import { useUserStore } from '@/stores/user'
import { resolveImage } from '@/utils/image'
import { useStoreStore } from '@/stores/store'
import { useToastStore } from '@/stores/toast'
import { formatPrice, formatSold } from '@/utils/formatters'
import { SugarLevel, IceLevel } from '@/constants/enums'
import defaultDrink from '@/assets/images/others/default-drink.png'
import { useProductStore } from '@/stores/product'

const props = defineProps({
  product: { type: Object, required: true },
})

const cartStore = useCartStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const toastStore = useToastStore()
const productStore = useProductStore()

const quantity = ref(1)
const isAdding = ref(false)

const fullImageUrl = computed(() => resolveImage(props.product.imageUrl, defaultDrink))
const handleImageError = (e) => {
  e.target.src = defaultDrink
  e.target.onerror = null
}
const defaultSize = computed(() => {
  const sizes = props.product.availableSizes || []
  if (sizes.length === 0) return null

  return sizes.reduce(
    (prev, curr) => (prev.priceModifier < curr.priceModifier ? prev : curr),
    sizes[0],
  )
})

const defaultSugarId = SugarLevel.PERCENT_100
const defaultIceId = IceLevel.PERCENT_100

const isNew = computed(() => {
  return productStore.checkIsNew(props.product.id)
})

const isBestSeller = computed(() => {
  return productStore.checkIsBestSeller(props.product.id)
})

// --- LOGIC MỚI: KIỂM TRA TRẠNG THÁI STORE ---
const storeStatus = computed(() => {
  // Nếu chưa chọn store thì cho phép xem (nhưng lúc add to cart sẽ bắt chọn)
  if (!storeStore.selectedStoreId) return { isOpen: true, message: '' }

  const store = storeStore.stores.find((s) => s.id === storeStore.selectedStoreId)
  return storeStore.getStoreStatus(store)
})

const isDisabled = computed(() => {
  // Disable nếu đang adding HOẶC (đã chọn store VÀ store đóng)
  return isAdding.value || (storeStore.selectedStoreId && !storeStatus.value.isOpen)
})

const addToCart = async (event) => {
  event.preventDefault()
  if (isDisabled.value) {
    if (!storeStatus.value.isOpen) {
      toastStore.show({ type: 'warning', message: `Cửa hàng ${storeStatus.value.message}` })
    }
    return
  }

  if (!userStore.isLoggedIn) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập để mua hàng' })
    return
  }

  if (props.product.availableSizes?.length > 0 && !defaultSize.value) {
    return
  }

  const itemToAdd = {
    storeId: storeStore.selectedStoreId,
    productId: props.product.id,
    quantity: quantity.value,
    sizeId: defaultSize.value ? defaultSize.value.id : null,
    sugarLevelId: defaultSugarId,
    iceLevelId: defaultIceId,
    note: '',
    toppings: [],
  }

  isAdding.value = true
  try {
    await cartStore.addToCart(itemToAdd)

    toastStore.show({
      type: 'success',
      message: `Đã thêm ${props.product.name} vào giỏ hàng!`,
    })

    quantity.value = 1 // Reset số lượng
  } catch (err) {
    console.error('Lỗi thêm giỏ hàng:', err)
    toastStore.show({
      type: 'error',
      message: err.response?.data?.message || 'Lỗi thêm vào giỏ',
    })
  } finally {
    isAdding.value = false
  }
}
const link = computed(() => {
  return `/products/${props.product.slug}`
})
</script>

<template>
  <div
class="group flex-shrink-0 max-w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full relative"
    :class="{ 'opacity-75 grayscale': isClosed }"  >
    <div
      v-if="storeStore.selectedStoreId && !storeStatus.isOpen"
      class="absolute inset-0 z-20 bg-gray-900/50 flex flex-col items-center justify-center text-white backdrop-blur-[1px]"
    >
    
      <span class="text-sm font-medium bg-red-600 px-3 py-1 rounded-full">
        {{ storeStatus.message }}
      </span>
    </div>
    <router-link :to="link" class="block flex-1 flex-col">
      <div class="relative w-full aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        <img
          :src="fullImageUrl"
          :alt="product.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          @error="handleImageError"
        />

        <div
          class="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-orange-500 shadow-sm flex items-center gap-1"
        >
          <span>{{ product.totalRating || 5.0 }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="w-3 h-3"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span
            v-if="isBestSeller"
            class="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse"
          >
            🔥 HOT
          </span>
          <span
            v-if="isNew"
            class="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm"
          >
            NEW
          </span>
        </div>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <h3
          class="font-bold text-gray-800 dark:text-white text-lg mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-green-600 transition-colors"
        >
          {{ product.name }}
        </h3>
        <div class="mb-3">
          <span
            class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
          >
            Đã bán {{ formatSold(product.totalSold) }}
          </span>
        </div>
        <div class="mt-auto flex items-end justify-between">
          <div class="flex flex-col">
            <span class="font-extrabold text-primary text-xl">{{
              formatPrice(product.basePrice)
            }}</span>
          </div>

          <button
            v-if="storeStore.selectedStoreId"
            @click.stop.prevent="addToCart"
            :disabled="isDisabled"
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="!isDisabled ? 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-gray-200 text-gray-400'"
            :title="!storeStatus.isOpen ? storeStatus.message : 'Thêm nhanh vào giỏ'"
          >
            <span
              v-if="isAdding"
              class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
            ></span>

            <svg
              v-else
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
          </button>
          <span
            v-else
            class="text-xs font-medium text-gray-400 group-hover:text-green-600 flex items-center gap-1 transition-colors"
          >
            Chi tiết
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
