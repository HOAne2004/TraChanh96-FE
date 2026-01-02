<script setup>
import { resolveImage } from '@/utils/image'
import defaultDrink from '@/assets/images/others/default-drink.png' // Import ảnh default


const props = defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  storeId: {
    type: Number,
    required: true,
  },
  loading: Boolean
})

// Format tiền
const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

// Hàm xử lý ảnh an toàn
const getItemImage = (url) => resolveImage(url, defaultDrink)

const handleImageError = (e) => {
  e.target.src = defaultDrink
  e.target.onerror = null
}

// Hiển thị toppings (Sửa lại key truy cập cho đúng DTO)
const getToppingsDisplay = (toppings) => {
  if (!toppings || !Array.isArray(toppings) || toppings.length === 0) {
    return ''
  }
  // Backend trả về CartToppingReadDto có trường productName
  return toppings.map((t) => t.productName || '').join(', ')
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

const emit = defineEmits([
  'update-quantity',
  'remove-item',
  'clear-cart',
])

</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Các sản phẩm tại cửa hàng</h2>
      <button v-if="cartItems.length" @click="emit('clear-cart', storeId)">
        Xóa tất cả
      </button>
    </div>

    <div
      v-for="item in cartItems"
      :key="item.id"
      class="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md"
    >
      <router-link :to="`/products/${item.productId}`" class="flex-shrink-0">
        <img
          :src="getItemImage(item.imageUrl)"
          :alt="item.productName"
          class="w-24 h-24 object-cover rounded-lg border border-gray-100 dark:border-gray-600"
          @error="handleImageError"
        />
      </router-link>

      <div class="flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 mr-2">
              {{ item.productName }}
            </h3>
            <span class="text-sm text-gray-500">
  {{ formatCurrency(item.finalPrice / item.quantity) }} / ly
</span>
<span class="font-bold text-green-600">
  {{ formatCurrency(item.finalPrice) }}
</span>

          </div>

          <div
            v-if="hasOptions(item)"
            class="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-0.5"
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
              class="text-xs text-gray-500 italic"
            >
              + Topping: {{ getToppingsDisplay(item.toppings) }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg h-8">
            <button
              @click="emit('update-quantity', item.id, item.quantity - 1)"
              class="px-2.5 h-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg text-gray-500 transition disabled:opacity-50"
              :disabled="loading || item.quantity <= 1"
            >
              -
            </button>
            <span
              class="px-3 text-sm font-bold text-gray-800 dark:text-white min-w-[1.5rem] text-center"
            >
              {{ item.quantity }}
            </span>
            <button
              @click="emit('update-quantity', item.id, item.quantity + 1)"
              class="px-2.5 h-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg text-gray-500 transition"
            >
              +
            </button>
          </div>

          <button
            @click="emit('remove-item', item.id)"
            class="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
