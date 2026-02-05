<script setup>
import { formatPrice } from '@/utils/formatters'
import drinkDefault from '@/assets/images/others/default-drink.png'
import { ORDER_STATUS } from '@/constants/order.constants' // 1. Import Constant

const props = defineProps({
  items: { type: Array, required: true },
  allowReview: { type: Boolean, default: false },
  orderStatus: { type: Number, default: 0 },
  reviewedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['review'])

const isReviewed = (item) => {
  return props.reviewedIds.includes(item.productId)
}

const canReview = (item) => {
  return (
    props.allowReview &&
    (props.orderStatus === ORDER_STATUS.COMPLETED || props.orderStatus === ORDER_STATUS.RECEIVED) &&
    !isReviewed(item)
  )
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
  >
    <div
      class="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 flex justify-between"
    >
      <span>Chi tiết sản phẩm</span>
      <span
        class="text-xs font-normal text-gray-500 bg-white dark:bg-gray-600 px-2 py-1 rounded-full border"
      >
        {{ items.length }} món
      </span>
    </div>

    <div class="p-4 space-y-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
      >
        <div
          class="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        >
          <img
            :src="item.productImage || drinkDefault"
            class="w-full h-full object-cover"
            alt="Product"
          />
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-gray-800 dark:text-white text-base line-clamp-2">
              {{ item.productName }}
            </h4>
            <div class="text-right">
              <p class="font-bold text-gray-900 dark:text-white">
                {{ formatPrice(item.finalPrice) }}
              </p>
              <p class="text-xs text-gray-500">x{{ item.quantity }}</p>
            </div>
          </div>

          <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
            <span v-if="item.sizeName" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
              >Size: {{ item.sizeName }}</span
            >
            <span
              v-if="item.sugarLevel !== undefined"
              class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
              >{{ item.sugarLevel }}% đường</span
            >
            <span
              v-if="item.iceLevel !== undefined"
              class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
              >{{ item.iceLevel }}% đá</span
            >
          </div>

          <div
            v-if="item.toppings && item.toppings.length > 0"
            class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm"
          >
            <p class="text-[10px] uppercase text-gray-400 font-bold mb-1">Topping thêm:</p>
            <ul class="space-y-1">
              <li
                v-for="top in item.toppings"
                :key="top.id"
                class="flex justify-between text-gray-600 dark:text-gray-300 text-xs"
              >
                <span>+ {{ top.productName }}</span>
                <span>{{ formatPrice(top.finalPrice) }}</span>
              </li>
            </ul>
          </div>

          <p
            v-if="item.note"
            class="text-xs text-orange-500 italic mt-2 bg-orange-50 dark:bg-orange-900/10 p-1.5 rounded border border-orange-100 dark:border-orange-900/20 inline-block"
          >
            Note: "{{ item.note }}"
          </p>

          <div
            class="flex justify-end mt-3 pt-2 border-t border-dashed border-gray-100 dark:border-gray-700 items-center"
          >
            <button
              v-if="canReview(item)"
              @click="$emit('review', item)"
              class="flex items-center gap-1 text-xs font-bold text-green-600 border border-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              Viết đánh giá
            </button>

            <div
              v-else-if="isReviewed(item)"
              class="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Đã đánh giá
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
