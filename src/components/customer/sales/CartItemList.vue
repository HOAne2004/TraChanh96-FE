<script setup>
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/system/toast.store' 
import { storeToRefs } from 'pinia' 
import {formatPrice} from '@/utils/formatters'
import { useSettingStore } from '@/stores/system/setting.store'

const router = useRouter()
const { maxQuantityPerItem } = storeToRefs(useSettingStore())
const toastStore = useToastStore() 

const props = defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  storeId: {
    type: Number,
    required: true,
  },
  loading: Boolean,
})



const getUnitPrice = (item) => {
  return item.basePrice || 0
}

const getItemTotalPrice = (item) => {
  return item.finalPrice || 0
}
const getToppingsDisplay = (toppings) => {
  if (!toppings || !Array.isArray(toppings) || toppings.length === 0) {
    return ''
  }
  return toppings
    .map((t) => {
      const priceText = t.basePrice ? ` (${formatPrice(t.basePrice)})` : ''
      return `${t.productName || ''}${priceText}`
    })
    .join(', ')
}

// Kiểm tra item có options không
const hasOptions = (item) => {
  return (
    item.sizeLabel ||
    item.sugarLabel ||
    item.iceLabel ||
    (item.toppings && item.toppings.length > 0)
  )
}

const navigateToProduct = (slug) => {
  if (slug) {
    router.push(`/products/${slug}`)
  }
}

const emit = defineEmits(['update-quantity', 'remove-item', 'clear-cart'])

const handleQuantityInput = (item, event) => {
  // Lấy giá trị khách gõ và ép về số nguyên (xóa bỏ số thập phân nếu có)
  let val = parseInt(event.target.value, 10)

  // 1. Chống nhập chữ (NaN) -> Trả về số lượng hiện tại
  if (isNaN(val)) {
    event.target.value = item.quantity
    return
  }

  // 2. Chống số âm và số 0 -> Ép về 1 (nếu muốn xóa thì phải bấm nút thùng rác)
  if (val < 1) {
    val = 1
  }

  // 3. Chống nhập quá giới hạn từng món
  if (val > maxQuantityPerItem.value) {
    val = maxQuantityPerItem.value
    toastStore.show({ 
      type: 'warning', 
      message: `Hệ thống chỉ cho phép đặt tối đa ${maxQuantityPerItem.value} ly cho món này.` 
    })
  }

  // Ép ô input hiển thị lại con số đã được "nắn" chuẩn
  event.target.value = val

  // 4. Chỉ gọi API update nếu con số thực sự có thay đổi
  if (val !== item.quantity) {
    emit('update-quantity', item.id, val)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Các sản phẩm tại cửa hàng</h2>
      <button
        v-if="cartItems.length"
        @click.stop="emit('clear-cart', storeId)"
        class="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
      >
        Xóa tất cả
      </button>
    </div>

    <div
      v-for="item in cartItems"
      :key="item.id"
      @click="navigateToProduct(item.productSlug)"
      class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md cursor-pointer group"
    >
      <div class="flex-shrink-0 mx-auto sm:mx-0">
        <img
          :src="item.imageUrl"
          :alt="item.productName"
          class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-gray-100 dark:border-gray-600 transition-transform group-hover:scale-105"
          v-img-fallback="'drink'"
        />
      </div>

      <div class="flex-1 flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
            <h3 class="font-bold text-base sm:text-lg text-gray-800 dark:text-white line-clamp-2 flex-1 group-hover:text-green-600 transition-colors">
              {{ item.productName }}
            </h3>
            <div class="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end mt-1 sm:mt-0 min-w-fit">
              <span class="text-xs sm:text-sm text-gray-500">
                {{ formatPrice(getUnitPrice(item)) }} / ly
              </span>
              <span class="font-bold text-green-600 text-sm sm:text-base">
                {{ formatPrice(getItemTotalPrice(item)) }}
              </span>
            </div>
          </div>

          <div
            v-if="hasOptions(item)"
            class="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1"
          >
            <p v-if="item.sizeLabel">
              Size:
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.sizeLabel }}</span>
            </p>
            <div class="flex gap-3">
              <p v-if="item.sugarLabel">Đường: {{ item.sugarLabel }}</p>
              <p v-if="item.iceLabel">Đá: {{ item.iceLabel }}</p>
            </div>
            <p
              v-if="item.toppings && item.toppings.length > 0"
              class="text-xs text-gray-500 italic break-words"
            >
              + Topping: {{ getToppingsDisplay(item.toppings) }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg h-8 bg-white dark:bg-gray-800" @click.stop>
            <button
              @click.stop="emit('update-quantity', item.id, item.quantity - 1)"
              class="px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg text-gray-500 transition disabled:opacity-50 flex items-center justify-center"
              :disabled="loading || item.quantity <= 1"
            >
              -
            </button>

            <input
              type="text"
              inputmode="numeric"
              :value="item.quantity"
              :disabled="loading"
              @blur="handleQuantityInput(item, $event)"
              @keyup.enter="$event.target.blur()"
              class="w-12 text-sm font-bold text-gray-800 dark:text-white text-center bg-transparent border-x border-gray-100 dark:border-gray-600 focus:ring-0 p-0 h-full outline-none disabled:opacity-50"
              title="Nhập số lượng"
            />

            <button
              @click.stop="emit('update-quantity', item.id, item.quantity + 1)"
              class="px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg text-gray-500 transition disabled:opacity-50 flex items-center justify-center"
              :disabled="loading || item.quantity >= maxQuantityPerItem"
            >
              +
            </button>
          </div>

          <button
            @click.stop="emit('remove-item', item.id)"
            class="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
            title="Xóa sản phẩm"
            aria-label="Xóa sản phẩm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
