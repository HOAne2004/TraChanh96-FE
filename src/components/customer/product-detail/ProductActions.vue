<script setup>
import { computed } from 'vue'
import Button from '@/components/common/Button.vue'
import { formatPrice } from '@/utils/formatters'

const props = defineProps({
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  note: { type: String, default: '' },
  isAdding: { type: Boolean, default: false },
  storeStatus: { type: Object, required: true }, // { isOpen, message }
  isDisabled: { type: Boolean, default: false },
  hasSelectedStore: { type: Boolean, default: false },
  isAvailableAtStore: { type: Boolean, default: true }, // Có bán tại quán không
  isSoldOut: { type: Boolean, default: false }, // Có hết hàng không
})

const emit = defineEmits(['update:quantity', 'update:note', 'add-to-cart'])
const actionLabel = computed(() => {
  if (props.isAdding) return 'Đang xử lý...'

  // 1. Cửa hàng đóng cửa
  if (!props.storeStatus.isOpen) return props.storeStatus.message || 'Cửa hàng đóng cửa'

  // 2. Món không bán tại quán này
  if (!props.isAvailableAtStore) return 'Không bán tại cửa hàng này'

  // 3. Món hết hàng
  if (props.isSoldOut) return 'Tạm hết hàng'

  // 4. Mặc định
  return 'Thêm vào giỏ'
})

const buyNowLabel = computed(() => {
  if (props.isAdding) return '...'
  if (!props.storeStatus.isOpen || !props.isAvailableAtStore || props.isSoldOut)
    return 'Không khả dụng'
  return 'Mua ngay'
})

const increase = () => {
  if (props.quantity < 100) emit('update:quantity', props.quantity + 1)
}
const decrease = () => {
  if (props.quantity > 1) emit('update:quantity', props.quantity - 1)
}
</script>

<template>
  <div class="pt-6 border-t dark:border-gray-700 flex flex-col gap-4 items-center">
    <div class="w-full flex gap-10 items-center">
      <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
        <button
          @click="decrease"
          class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          -
        </button>
        <span class="px-4 font-bold min-w-[3rem] text-center">{{ quantity }}</span>
        <button
          @click="increase"
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
      <label class="block font-bold text-gray-700 dark:text-gray-200 mb-2">Ghi chú món:</label>
      <textarea
        :value="note"
        @input="emit('update:note', $event.target.value)"
        rows="2"
        placeholder="Ví dụ: Ít ngọt, nhiều trân châu..."
        class="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none transition-shadow"
      ></textarea>
    </div>

    <div v-if="hasSelectedStore" class="w-full flex gap-10 items-center">
      <Button
        :label="actionLabel"
        class="flex-1 rounded-full text-lg shadow-lg shadow-green-200 dark:shadow-none h-12"
        :variant="isDisabled ? 'secondary' : 'outline'"
        :disabled="isDisabled"
        @click="emit('add-to-cart', false)"
      >
        <template #icon v-if="!isDisabled">
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
        :label="buyNowLabel"
        class="flex-1 rounded-full text-lg shadow-lg shadow-green-200 dark:shadow-none h-12"
        variant="primary"
        :disabled="isDisabled"
        @click="emit('add-to-cart', true)"
      />
    </div>

    <div v-else class="w-full flex gap-10 items-center">
      <Button
        label="Hãy chọn một cửa hàng"
        class="flex-1 rounded-full text-lg h-12"
        variant="primary"
        :disabled="true"
      />
    </div>
  </div>
</template>
