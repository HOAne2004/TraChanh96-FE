<script setup>
import { formatPrice } from '@/utils/formatters'

defineProps({
  order: { type: Object, required: true }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4 border border-gray-100 dark:border-gray-700">
    <h3 class="font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">
      Tổng thanh toán
    </h3>

    <div class="space-y-3 text-sm">
      <div class="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Tổng tiền hàng</span>
        <span>{{ formatPrice(order.totalAmount) }}</span>
      </div>
      <div class="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Phí vận chuyển</span>
        <span>+ {{ formatPrice(order.shippingFee || 0) }}</span>
      </div>
      <div v-if="order.discountAmount" class="flex justify-between text-green-600 font-medium">
        <span>Voucher giảm giá</span>
        <span>- {{ formatPrice(order.discountAmount) }}</span>
      </div>

      <div class="border-t border-dashed border-gray-300 my-2"></div>

      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-800 dark:text-white">Thành tiền</span>
        <span class="text-xl font-extrabold text-green-600">{{ formatPrice(order.grandTotal) }}</span>
      </div>

      <div class="flex justify-between items-center pt-2">
        <span class="text-xs text-gray-500">Phương thức:</span>
        <span class="text-xs font-bold">{{ order.paymentMethod?.name || order.paymentMethodName || 'COD' }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">Trạng thái TT:</span>
        <span :class="order.isPaid ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'">
          {{ order.isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN' }}
        </span>
      </div>
    </div>

    <div class="mt-6 border-t pt-4">
       <slot name="actions"></slot>
    </div>
  </div>
</template>