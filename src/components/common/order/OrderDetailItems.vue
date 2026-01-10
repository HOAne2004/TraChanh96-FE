<script setup>
import { formatPrice } from '@/utils/formatters'
import drinkDefault from '@/assets/images/others/default-drink.png'
defineProps({
  items: { type: Array, required: true }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
    <div class="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 flex justify-between">
      <span>Chi tiết sản phẩm</span>
      <span class="text-xs font-normal text-gray-500 bg-white dark:bg-gray-600 px-2 py-1 rounded-full border">
        {{ items.length }} món
      </span>
    </div>

    <div class="p-4 space-y-6">
      <div v-for="item in items" :key="item.id" class="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
        <div class="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <img :src="item.productImage || drinkDefault" class="w-full h-full object-cover" alt="Product" />
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-gray-800 dark:text-white text-base line-clamp-2">
              {{ item.productName }}
            </h4>
            <div class="text-right">
               <p class="font-bold text-gray-900 dark:text-white">{{ formatPrice(item.finalPrice) }}</p>
               <p class="text-xs text-gray-500">x{{ item.quantity }}</p>
            </div>
          </div>

          <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
            <span v-if="item.sizeName" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Size: {{ item.sizeName }}</span>
            <span v-if="item.sugarLevel !== undefined" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ item.sugarLevel }}% đường</span>
            <span v-if="item.iceLevel !== undefined" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ item.iceLevel }}% đá</span>
          </div>

          <div v-if="item.toppings && item.toppings.length > 0" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
            <p class="text-[10px] uppercase text-gray-400 font-bold mb-1">Topping thêm:</p>
            <ul class="space-y-1">
              <li v-for="top in item.toppings" :key="top.id" class="flex justify-between text-gray-600 dark:text-gray-300 text-xs">
                <span>+ {{ top.productName }}</span>
                <span>{{ formatPrice(top.finalPrice) }}</span>
              </li>
            </ul>
          </div>

          <p v-if="item.note" class="text-xs text-orange-500 italic mt-2 bg-orange-50 dark:bg-orange-900/10 p-1.5 rounded border border-orange-100 dark:border-orange-900/20 inline-block">
             Note: "{{ item.note }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
