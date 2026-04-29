<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/sales/cart.store'
import { useUserStore } from '@/stores/identity/user.store'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { useProductStore } from '@/stores/catalog/product.store'
import { useToastStore } from '@/stores/system/toast.store'
import { resolveImage } from '@/utils/image'
import { formatPrice, formatSold } from '@/utils/formatters'
import { SugarLevel, IceLevel } from '@/constants/enums'
import defaultDrink from '@/assets/images/others/default-drink.png'

const props = defineProps({
  product: { type: Object, required: true },
})

// Stores & Router

const cartStore = useCartStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const toastStore = useToastStore()
const productStore = useProductStore()

// State
const quantity = ref(1)
const isAdding = ref(false)

// --- COMPUTED PROPERTIES ---

const fullImageUrl = computed(() => resolveImage(props.product.imageUrl, defaultDrink))

const isNew = computed(() => productStore.checkIsNew(props.product.id))
const isBestSeller = computed(() => productStore.checkIsBestSeller(props.product.id))

const defaultSize = computed(() => {
  const sizes = props.product.availableSizes || []
  if (sizes.length === 0) return null
  return sizes.reduce(
    (prev, curr) => (prev.priceModifier < curr.priceModifier ? prev : curr),
    sizes[0],
  )
})

// 1. Logic kiểm tra trạng thái Cửa hàng (Mở/Đóng)
const storeStatus = computed(() => {
  if (!storeStore.selectedStoreId) return { isOpen: true, message: '' }

  // Tìm store trong list hoặc fallback về currentStore (fix lỗi khi vào thẳng trang chi tiết)
  let store = storeStore.stores.find((s) => s.id === storeStore.selectedStoreId)
  if (!store && storeStore.currentStore?.id === storeStore.selectedStoreId) {
    store = storeStore.currentStore
  }

  if (!store) return { isOpen: true, message: '' }
  return storeStore.getStoreStatus(store)
})

// 2. 🔥 CORE LOGIC: Xác định trạng thái khả dụng của sản phẩm
// Trả về Object { label: 'Lý do', class: 'màu sắc' } hoặc Null (nếu mua được)
const availabilityStatus = computed(() => {
  // A. Chưa chọn quán -> Xem bình thường
  if (!storeStore.selectedStoreId) return null

  // B. Quán Đóng cửa
  if (!storeStatus.value.isOpen) {
    return { label: storeStatus.value.message || 'Đóng cửa', class: 'bg-red-600' }
  }

  // C. Sản phẩm Không bán tại quán này
  // (Chỉ check nếu sản phẩm có danh sách storeIds - trường hợp xem ở list tổng)
  if (
    props.product.storeIds &&
    Array.isArray(props.product.storeIds) &&
    props.product.storeIds.length > 0
  ) {
    if (!props.product.storeIds.includes(storeStore.selectedStoreId)) {
      return { label: 'Không bán tại đây', class: 'bg-gray-500' }
    }
  }

  // D. Hết hàng (Check cả cờ isSoldOut và status string từ BE)
  if (props.product.isSoldOut || props.product.storeStatus === 'OutOfStock') {
    return { label: 'Tạm hết hàng', class: 'bg-orange-500' }
  }

  return null // Available
})

// Disable tương tác nếu có status bất thường hoặc đang add
const isDisabled = computed(() => !!availabilityStatus.value || isAdding.value)

const cardClasses = computed(() => {
  return isDisabled.value ? 'opacity-80 grayscale-[0.5]' : 'hover:shadow-lg hover:-translate-y-1'
})

const link = computed(() => `/products/${props.product.slug}`)

const handleImageError = (e) => {
  e.target.src = defaultDrink
  e.target.onerror = null
}

// --- METHODS ---

const addToCart = async (event) => {
  event.preventDefault() // Chặn link router

  // 1. Validate nhanh (dù UI đã chặn)
  if (isDisabled.value) {
    if (availabilityStatus.value) {
      toastStore.show({ type: 'warning', message: availabilityStatus.value.label })
    }
    return
  }

  if (!userStore.isLoggedIn) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập để mua hàng' })
    return
  }

  if (!storeStore.selectedStoreId) {
    toastStore.show({ type: 'warning', message: 'Vui lòng chọn cửa hàng trước khi mua' })
    return
  }

  if (props.product.availableSizes?.length > 0 && !defaultSize.value) {
    toastStore.show({ type: 'warning', message: 'Vui lòng chọn size cho sản phẩm' })
    return
  }

  // 2. Prepare Payload
  const itemToAdd = {
    storeId: storeStore.selectedStoreId,
    productId: props.product.id,
    quantity: quantity.value,
    sizeId: defaultSize.value?.id ?? null,
    sugarLevelId: SugarLevel.PERCENT_100,
    iceLevelId: IceLevel.PERCENT_100,
    note: '',
    toppings: [],
  }

  // 3. Call API
  isAdding.value = true
  try {
    await cartStore.addToCart(itemToAdd)
    toastStore.show({
      type: 'success',
      message: `Đã thêm ${props.product.name} vào giỏ hàng`,
    })
  } catch (err) {
    console.error('Lỗi thêm giỏ hàng:', err)
    toastStore.show({
      type: 'error',
      message: err.response?.data?.message || 'Lỗi thêm vào giỏ hàng',
    })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <div
    class="group flex-shrink-0 max-w-[200px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full relative transition-all duration-300"
    :class="cardClasses"
  >
    <div
      v-if="availabilityStatus"
      class="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/10 pointer-events-none"
    >
      <span
        class="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
        :class="availabilityStatus.class"
      >
        {{ availabilityStatus.label }}
      </span>
    </div>

    <router-link :to="link" class="block flex-1 flex-col h-full">
      <div class="relative w-full aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        <img
          :src="fullImageUrl"
          :alt="product.name"
          class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
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

        <div class="mt-auto flex items-end justify-between relative z-30">
          <div class="flex flex-col">
            <span class="font-extrabold text-primary text-xl">
              {{ formatPrice(product.displayPrice || product.basePrice) }}
            </span>
          </div>

          <button
            v-if="storeStore.selectedStoreId && !isDisabled"
            @click.stop="addToCart"
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white"
            title="Thêm nhanh vào giỏ"
          >
            <span
              v-if="isAdding"
              class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"
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
