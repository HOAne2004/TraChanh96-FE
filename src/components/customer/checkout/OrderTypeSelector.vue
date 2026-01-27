<script setup>
import { computed } from 'vue'
import { ORDER_TYPE } from '@/constants/order.constants'

const props = defineProps({
  modelValue: { type: String, required: true },
  types: { type: Array, default: () => [ORDER_TYPE.DELIVERY, ORDER_TYPE.PICKUP] }
})

const emit = defineEmits(['update:modelValue'])

const selectType = (type) => {
  emit('update:modelValue', type)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <button
      v-if="types.includes(ORDER_TYPE.DELIVERY)"
      @click="selectType(ORDER_TYPE.DELIVERY)"
      class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2"
      :class="modelValue === ORDER_TYPE.DELIVERY
        ? 'border-green-600 bg-green-50 text-green-700'
        : 'border-gray-200 bg-white text-gray-500 hover:border-green-200'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span class="font-bold">Giao hàng tận nơi</span>
    </button>

    <button
      v-if="types.includes(ORDER_TYPE.PICKUP)"
      @click="selectType(ORDER_TYPE.PICKUP)"
      class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2"
      :class="modelValue === ORDER_TYPE.PICKUP
        ? 'border-green-600 bg-green-50 text-green-700'
        : 'border-gray-200 bg-white text-gray-500 hover:border-green-200'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <span class="font-bold">Đến lấy tại quán</span>
    </button>
  </div>
</template>
