<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePosStore } from '@/stores/pos'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useStoreStore } from '@/stores/store'
import { formatPrice } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'
import { useToastStore } from '@/stores/toast'
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
const toastStore = useToastStore()

// Modal State
const isModalOpen = ref(false)
const selectedProductForModal = ref(null)
const isPaymentModalOpen = ref(false)
const printingOrder = ref(null)
const orderCode = ref('DH - ' + new Date().getTime().toString().slice(-6))
const currentStoreName = computed(() => storeStore.currentStore?.name || 'TRÀ CHANH 96')
const currentStoreId = computed(() => {
  return storeStore.currentStore?.id || null
})

// --- LIFECYCLE ---
onMounted(async () => {
  // 1. Đảm bảo reset bộ lọc về mặc định (Tất cả)
  posStore.selectedCategory = null
  posStore.searchQuery = ''

  // 2. Gọi API tải dữ liệu
  await Promise.all([productStore.fetchProducts(), categoryStore.fetchCategories()])
})

// --- COMPUTED ---
// Lọc sản phẩm theo Category và Search (Dùng dữ liệu từ productStore)
const filteredProducts = computed(() => {
  // Lấy danh sách sản phẩm Active từ Store
  let result = productStore.activeProducts || []

  // 1. Filter Category
  if (posStore.selectedCategory) {
    // Cần xử lý logic lấy cả sản phẩm con nếu chọn category cha (nếu muốn)
    // Ở đây filter đơn giản theo CategoryId trực tiếp
    result = result.filter((p) => p.categoryId === posStore.selectedCategory)
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
  selectedProductForModal.value = product
  isModalOpen.value = true
}

const handleConfirmAddToCart = (itemData) => {
  posStore.addToCart(itemData)
  isModalOpen.value = false
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
            class="w-full py-2.5 pl-10 pr-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
          />
        </div>

        <div class="flex space-x-2 overflow-x-auto no-scrollbar max-w-md">
          <button
            @click="posStore.selectedCategory = null"
            class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border"
            :class="
              !posStore.selectedCategory
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            "
          >
            Tất cả
          </button>

          <button
            v-for="cat in categoryStore.flatCategories"
            :key="cat.id"
            @click="posStore.selectedCategory = cat.id"
            class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border"
            :class="
              posStore.selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            "
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        <div
          v-if="productStore.loading"
          class="absolute inset-0 flex items-center justify-center bg-white/50 z-10"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            @click="handleProductClick(product)"
            class="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md cursor-pointer border border-transparent hover:border-blue-500 transition-all flex flex-col h-full active:scale-95 duration-150 group"
          >
            <div class="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 relative">
              <img
                :src="resolveImage(product.imageUrl)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                @error="handleImageError"
              />
              <span
                class="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm"
              >
                {{ formatPrice(product.basePrice) }}
              </span>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <h3 class="text-sm font-bold text-gray-800 line-clamp-2 mb-1 leading-snug">
                {{ product.name }}
              </h3>
              <span class="text-xs text-gray-400">{{ product.code || 'SP' + product.id }}</span>
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
          <span class="text-sm font-bold text-blue-600">#{{ orderCode }}</span>
        </div>
        <div class="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
          <button
            @click="posStore.orderType = ORDER_TYPE.AT_COUNTER"
            class="px-3 py-1.5 rounded-md transition-all"
            :class="
              posStore.orderType === ORDER_TYPE.AT_COUNTER
                ? 'bg-white text-blue-600 shadow-sm'
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
                ? 'bg-white text-blue-600 shadow-sm'
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
          class="flex p-3 bg-gray-50 rounded-xl border border-gray-100 group relative hover:border-blue-200 transition-colors"
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
              @click="posStore.updateQuantity(index, 1)"
              class="w-6 h-6 rounded bg-white border border-gray-200 text-blue-600 flex items-center justify-center hover:bg-blue-50"
            >
              +
            </button>
            <span class="text-sm font-bold w-6 text-center">{{ item.quantity }}</span>
            <button
              @click="posStore.updateQuantity(index, -1)"
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
          <span class="text-2xl font-extrabold text-blue-600">{{
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
            class="col-span-3 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
