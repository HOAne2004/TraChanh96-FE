<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePosStore } from '@/stores/pos'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useStoreStore } from '@/stores/store'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useModalStore } from '@/stores/modal'
import { formatPrice } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'
import { ORDER_TYPE } from '@/constants/order.constants'
import { SUGAR_LEVEL_UI, ICE_LEVEL_UI } from '@/constants/option.constants'
import defaultDrink from '@/assets/images/others/default-drink.png'

// Components
import ProductOptionModal from '@/components/staff/pos/ProductOptionModal.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue'
import PosPaymentModal from '@/components/staff/pos/PosPaymentModal.vue'
import ReceiptTemplate from '@/components/staff/order/ReceiptTemplate.vue'
// Stores
const posStore = usePosStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const storeStore = useStoreStore()
const userStore = useUserStore()
const toastStore = useToastStore()
const modalStore = useModalStore()

// Modal State
const isModalOpen = ref(false)
const selectedProductForModal = ref(null)
const isPaymentModalOpen = ref(false)
const printingOrder = ref(null)
const orderCode = ref('DH - ' + new Date().getTime().toString().slice(-6))
const currentStoreName = computed(
  () => storeStore.currentStore?.name || userStore.user?.staff?.storeName || 'TRÀ CHANH 96',
)
const currentStoreId = computed(() => {
  return storeStore.currentStore?.id || userStore.user?.staff?.storeId || null
})

// Dropdown State
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref(null)

const selectedCategoryName = computed(() => {
  if (!posStore.selectedCategory) return 'Tất cả danh mục'
  const cat = categoryStore.flatCategories.find((c) => c.id === posStore.selectedCategory)
  return cat ? (cat.displayName || cat.name).trim() : 'Tất cả danh mục'
})

const selectCategory = (id) => {
  posStore.selectedCategory = id
  isCategoryDropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target)) {
    isCategoryDropdownOpen.value = false
  }
}

// --- LIFECYCLE ---
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  posStore.selectedCategory = null
  posStore.searchQuery = ''

  await Promise.all([
    productStore.fetchProducts({ pageSize: 1000 }),
    categoryStore.fetchCategories(),
  ])
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// --- COMPUTED ---
// Lọc sản phẩm theo Category và Search (Dùng dữ liệu từ productStore)
const filteredProducts = computed(() => {
  let result = (productStore.products || []).filter((p) =>
    ['Active', 'Đang hoạt động', 'OutOfStock', 'Hết hàng', 2, 4].includes(p.status),
  )

  if (posStore.selectedCategory) {
    const isMatchingCat = (pCatId) => {
      if (pCatId === posStore.selectedCategory) return true
      const catObj = categoryStore.flatCategories.find((c) => c.id === pCatId)
      return catObj && catObj.parentId === posStore.selectedCategory
    }
    result = result.filter((p) => isMatchingCat(p.categoryId))
  }

  // 2. Filter Search
  if (posStore.searchQuery) {
    const query = posStore.searchQuery.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) || (p.code && p.code.toLowerCase().includes(query)),
    )
  }

  return result
})

// --- METHODS ---
const handleProductClick = (product) => {
  // Chặn khách hàng/nhân viên bấm vào thêm vào giỏ nếu đang hết hàng
  if (product.status === 'OutOfStock' || product.status === 'Hết hàng' || product.status === 4) {
    toastStore.show({ type: 'warning', message: 'Món này hiện đang hết hàng!' })
    return
  }
  selectedProductForModal.value = product
  isModalOpen.value = true
}

// Chuyển đổi trạng thái nhanh Của Món Ăn
const toggleProductStatus = async (product) => {
  const isOutOfStock =
    product.status === 'OutOfStock' || product.status === 'Hết hàng' || product.status === 4
  const newStatus = isOutOfStock ? 2 : 4 // 2: Active (Mở bán), 4: OutOfStock (Hết hàng)
  const actionName = isOutOfStock ? 'MỞ BÁN' : 'HẾT HÀNG'

  const isConfirmed = await modalStore.confirmAction(
    `Bạn muốn chuyển mục "${product.name}" sang trạng thái ${actionName}?`,
    'Xác nhận trạng thái',
  )

  if (!isConfirmed) return

  try {
    const payload = { ...product, status: newStatus }
    await productStore.updateProduct(product.id, payload)
  } catch (error) {
    console.error(error)
  }
}

const handleConfirmAddToCart = async (itemData) => {
  // Tìm xem món đã có trong giỏ chưa
  const existingIndex = posStore.cartItems.findIndex((existing) => {
    return (
      existing.product.id === itemData.product.id &&
      existing.options.sizeId === itemData.options.sizeId &&
      existing.options.sugar === itemData.options.sugar &&
      existing.options.ice === itemData.options.ice &&
      (existing.note || '').trim() === (itemData.note || '').trim()
    )
  })

  let currentQty = 0
  if (existingIndex !== -1) {
    currentQty = posStore.cartItems[existingIndex].quantity
  }

  const newQty = currentQty + itemData.quantity

  if (newQty > 99) {
    toastStore.show({
      type: 'warning',
      message: `Số lượng tối đa cho phép là 99 món. Bạn chỉ có thể thêm tối đa ${99 - currentQty} món nữa.`,
    })
    // Không đóng modal để khách chỉnh lại sl
    return
  }

  if (newQty > 50 && currentQty <= 50) {
    const isConfirmed = await modalStore.confirmAction(
      `Bạn chuẩn bị thêm số lượng lớn (${newQty} sản phẩm) cho món ${itemData.product.name}. Bạn có chắc chắn?`,
      'Cảnh báo số lượng',
    )
    if (!isConfirmed) return
  }

  posStore.addToCart(itemData)
  isModalOpen.value = false
}

const handleIncreaseCartQuantity = async (index, item) => {
  if (item.quantity >= 99) {
    toastStore.show({ type: 'warning', message: 'Chỉ được chọn tối đa 99 sản phẩm.' })
    return
  }

  if (item.quantity === 50) {
    const isConfirmed = await modalStore.confirmAction(
      'Bạn đang tăng số lượng lên rất lớn (trên 50 sản phẩm). Bạn có tiếp tục?',
      'Cảnh báo số lượng',
    )
    if (!isConfirmed) return
  }

  posStore.updateQuantity(index, item.quantity + 1)
}

const handleImageError = (e) => {
  e.target.src = defaultDrink
  e.target.onerror = null
}

// Helper hiển thị Label đường/đá
const getSugarLabel = (val) => SUGAR_LEVEL_UI[val]?.label || ''
const getIceLabel = (val) => ICE_LEVEL_UI[val]?.label || ''

// TODO: Thêm hàm handleEditItem để mở lại modal sửa món (nếu cần)
const handleEditItem = (item, index) => {
  // Logic mở lại modal với options đã chọn
  console.log('Edit item:', index)
}
// Hàm mở modal khi ấn nút Thanh toán
const handleCheckoutClick = () => {
  if (!currentStoreId.value) {
    toastStore.show({
      type: 'error',
      message: 'Chưa xác định được cửa hàng hiện tại',
    })
    return
  }

  if (posStore.cartItems.length === 0) return
  isPaymentModalOpen.value = true
}

// Hàm xử lý khi modal xác nhận xong
const handlePaymentConfirm = async ({ paymentMethodId }) => {
  try {
    const newOrder = await posStore.checkout({
      storeId: currentStoreId.value,
      paymentMethodId,
      orderType: posStore.orderType,
      note: '',
    })

    toastStore.show({
      type: 'success',
      message: 'Thanh toán thành công!',
    })

    isPaymentModalOpen.value = false

    handlePrintBill(newOrder)
  } catch (error) {
    console.error('Checkout failed:', error)

    toastStore.show({
      type: 'error',
      message: error?.response?.data?.message || 'Thanh toán thất bại',
    })
  }

  console.log('Checkout context', {
    storeId: currentStoreId.value,
    paymentMethodId,
    orderType: posStore.orderType,
    items: posStore.cartItems,
  })
}
const handlePrintBill = (order) => {
  printingOrder.value = order

  setTimeout(() => {
    window.print()
    orderCode.value = 'DH - ' + new Date().getTime().toString().slice(-6)
    // posStore.clearCart() // nếu BE chưa clear
  }, 500)
}
</script>
<template>
  <div class="flex h-full bg-white overflow-hidden">
    <div class="flex-1 flex flex-col border-r border-gray-200">
      <div class="p-4 border-b border-gray-100 flex space-x-4 bg-white shadow-sm z-10">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="posStore.searchQuery"
            type="text"
            placeholder="Tìm món (F3)"
            class="w-full py-2.5 pl-10 pr-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none text-sm"
          />
        </div>

        <div class="w-48 xl:w-64 max-w-md shrink-0 relative" ref="categoryDropdownRef">
          <button
            @click="isCategoryDropdownOpen = !isCategoryDropdownOpen"
            class="w-full py-2.5 pl-4 pr-4 bg-gray-100 border border-transparent hover:bg-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-colors cursor-pointer flex justify-between items-center text-gray-700"
          >
            <span class="truncate">{{ selectedCategoryName }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500"
              :class="{ 'rotate-180': isCategoryDropdownOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-show="isCategoryDropdownOpen"
            class="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-y-auto custom-scrollbar ring-1 ring-black/5"
          >
            <button
              @click="selectCategory(null)"
              class="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50"
              :class="
                posStore.selectedCategory === null
                  ? 'text-green-600 bg-green-50/50'
                  : 'text-gray-700'
              "
            >
              Tất cả danh mục
              <svg
                v-if="posStore.selectedCategory === null"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              v-for="cat in categoryStore.flatCategories"
              :key="cat.id"
              @click="selectCategory(cat.id)"
              class="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
              :class="
                posStore.selectedCategory === cat.id
                  ? 'text-green-600 bg-green-50/50'
                  : 'text-gray-700'
              "
            >
              <span class="truncate block whitespace-pre">{{ cat.displayName || cat.name }}</span>
              <svg
                v-if="posStore.selectedCategory === cat.id"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-green-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        <div
          v-if="productStore.loading"
          class="absolute inset-0 flex items-center justify-center bg-white/50 z-10"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            @click="handleProductClick(product)"
            class="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md cursor-pointer border border-transparent transition-all flex flex-col h-full active:scale-95 duration-150 group relative"
            :class="
              product.status === 'OutOfStock'
                ? 'opacity-90 grayscale-[20%] border-red-100/50'
                : 'hover:border-green-500'
            "
          >
            <!-- Nút Cập nhật Hết hàng/Mở bán -->
            <button
              @click.stop="toggleProductStatus(product)"
              class="absolute top-4 right-4 p-1.5 rounded-lg text-white shadow hover:scale-110 transition-transform flex items-center justify-center z-10"
              :class="
                product.status === 'OutOfStock'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              "
              :title="
                product.status === 'OutOfStock'
                  ? 'Đang Hết hàng (Bấm để Mở bán)'
                  : 'Đang Bán (Bấm để báo Hết hàng)'
              "
            >
              <svg
                v-if="product.status === 'OutOfStock'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            <div class="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 relative">
              <img
                :src="resolveImage(product.imageUrl)"
                class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                @error="handleImageError"
              />
              <span
                class="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm"
              >
                {{ formatPrice(product.basePrice) }}
              </span>

              <!-- Nhãn Hết hàng mờ đè lên ảnh -->
              <div
                v-if="product.status === 'OutOfStock'"
                class="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10"
              >
                <span
                  class="bg-red-600 text-white font-extrabold text-sm px-4 py-1.5 rounded-lg rotate-[-15deg] uppercase border-2 border-red-300 shadow-xl tracking-widest leading-none"
                  >Hết hàng</span
                >
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <h3
                class="text-sm font-bold text-gray-800 line-clamp-2 mb-1 leading-snug"
                :class="{
                  'text-gray-500 italic line-through decoration-red-400':
                    product.status === 'OutOfStock',
                }"
              >
                {{ product.name }}
              </h3>
              <span class="text-xs text-gray-400 font-medium">{{
                product.code || 'SP' + product.id
              }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="!productStore.loading && filteredProducts.length === 0"
          class="flex flex-col items-center justify-center h-full text-gray-400"
        >
          <CustomerEmptyState />
        </div>
      </div>
    </div>

    <div class="w-96 flex flex-col bg-white shadow-xl z-20 border-l border-gray-200">
      <div
        class="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white shrink-0"
      >
        <div class="flex flex-col">
          <span class="text-xs text-gray-400 font-medium">Đơn hàng mới</span>
          <span class="text-sm font-bold text-green-600">#{{ orderCode }}</span>
        </div>
        <div class="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
          <button
            @click="posStore.orderType = ORDER_TYPE.AT_COUNTER"
            class="px-3 py-1.5 rounded-md transition-all"
            :class="
              posStore.orderType === ORDER_TYPE.AT_COUNTER
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500'
            "
          >
            Tại bàn
          </button>
          <button
            @click="posStore.orderType = ORDER_TYPE.PICKUP"
            class="px-3 py-1.5 rounded-md transition-all"
            :class="
              posStore.orderType === ORDER_TYPE.PICKUP
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500'
            "
          >
            Mang về
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <div
          v-if="posStore.cartItems.length === 0"
          class="h-full flex flex-col items-center justify-center text-gray-400 opacity-60"
        >
          <img src="@/assets/images/empty-states/empty-cart.png" class="w-24 h-24 mb-2 grayscale" />
          <span class="text-sm">Chưa có món nào</span>
        </div>

        <div
          v-for="(item, index) in posStore.cartItems"
          :key="index"
          class="flex p-3 bg-gray-50 rounded-xl border border-gray-100 group relative hover:border-green-200 transition-colors"
        >
          <div class="flex-1 cursor-pointer" @click="handleEditItem(item, index)">
            <div class="flex justify-between items-start">
              <h4 class="text-sm font-semibold text-gray-800 line-clamp-1">
                {{ item.product.name }}
              </h4>
              <span class="text-sm font-bold text-gray-700">{{
                formatPrice(item.unitPrice * item.quantity)
              }}</span>
            </div>

            <div class="text-[10px] text-gray-500 mt-1 space-y-0.5">
              <p v-if="item.options.sizeLabel">Size: {{ item.options.sizeLabel }}</p>
              <div class="flex gap-2">
                <span v-if="item.options.sugar" class="bg-gray-100 px-1 rounded"
                  >Đường: {{ getSugarLabel(item.options.sugar) }}</span
                >
                <span v-if="item.options.ice" class="bg-gray-100 px-1 rounded"
                  >Đá: {{ getIceLabel(item.options.ice) }}</span
                >
              </div>
              <p v-if="item.note" class="italic text-orange-500">Note: {{ item.note }}</p>
            </div>
          </div>
          <div class="flex flex-col items-center justify-center mr-3 space-y-1">
            <button
              @click="handleIncreaseCartQuantity(index, item)"
              class="w-6 h-6 rounded bg-white border border-gray-200 text-green-600 flex items-center justify-center hover:bg-green-50"
            >
              +
            </button>
            <span class="text-sm font-bold w-6 text-center">{{ item.quantity }}</span>
            <button
              @click="posStore.updateQuantity(index, item.quantity - 1)"
              class="w-6 h-6 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-500"
            >
              -
            </button>
          </div>
          <button
            @click="posStore.removeFromCart(index)"
            class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            &times;
          </button>
        </div>
      </div>

      <div class="border-t border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Tạm tính ({{ posStore.totalItems }} món)</span>
          <span>{{ formatPrice(posStore.subTotal) }}</span>
        </div>
        <div class="flex justify-between text-sm text-green-600 cursor-pointer hover:underline">
          <span>Khuyến mãi / Voucher</span>
          <span>- 0 đ</span>
        </div>

        <div class="flex justify-between items-end border-t border-gray-300 pt-3">
          <span class="text-base font-bold text-gray-800">Tổng thu</span>
          <span class="text-2xl font-extrabold text-green-600">{{
            formatPrice(posStore.totalAmount)
          }}</span>
        </div>

        <div class="grid grid-cols-4 gap-2 mt-2">
          <button
            @click="posStore.clearCart"
            class="col-span-1 py-3 rounded-xl bg-white border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 active:scale-95 transition-transform"
            title="Hủy đơn"
          >
            Hủy
          </button>
          <button
            class="col-span-3 py-3 rounded-xl bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="posStore.cartItems.length === 0"
            @click="handleCheckoutClick"
          >
            <span>Thanh toán</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <ProductOptionModal
      :is-open="isModalOpen"
      :product="selectedProductForModal"
      @close="isModalOpen = false"
      @add-to-cart="handleConfirmAddToCart"
    />
    <PosPaymentModal
      :is-open="isPaymentModalOpen"
      :total-amount="posStore.totalAmount"
      :orderCode="orderCode"
      @close="isPaymentModalOpen = false"
      @confirm="handlePaymentConfirm"
    />

    <ReceiptTemplate
      v-if="printingOrder"
      :order="printingOrder"
      :store-name="currentStoreName"
      store-address="Địa chỉ cửa hàng..."
      store-phone="Hotline..."
    />
  </div>
</template>

<style scoped>
/* Ẩn scrollbar ngang cho danh mục để đẹp hơn */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
