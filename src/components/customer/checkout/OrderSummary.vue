<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { ORDER_TYPE } from '@/constants/order.constants'

const props = defineProps({
  subtotal: Number,
  shippingFee: Number,
  discount: Number,
  total: Number,
  orderType: Number
})

// Không cần emit event voucher ở đây nếu đã xử lý ở CartView,
// nhưng thường ở Checkout vẫn cho nhập voucher. Để đơn giản, ta chỉ hiển thị.
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
    <h3 class="font-bold text-lg mb-4 text-gray-800 dark:text-white">Tóm tắt đơn hàng</h3>

    <div class="space-y-3 text-sm">
      <div class="flex justify-between text-gray-600">
        <span>Tạm tính</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>

      <div v-if="orderType === ORDER_TYPE.DELIVERY" class="flex justify-between text-gray-600">
        <span>Phí giao hàng</span>
        <span class="font-medium">{{ formatPrice(shippingFee) }}</span>
      </div>

      <div v-if="discount > 0" class="flex justify-between text-green-600">
        <span>Giảm giá (Voucher)</span>
        <span>-{{ formatPrice(discount) }}</span>
      </div>
    </div>

    <div class="border-t my-4 dark:border-gray-700"></div>

    <div class="flex justify-between items-end">
       <span class="font-bold text-gray-800 dark:text-white">Tổng thanh toán</span>
       <span class="text-2xl font-extrabold text-green-600">{{ formatPrice(total) }}</span>
    </div>

    <p v-if="orderType === ORDER_TYPE.DELIVERY" class="text-[10px] text-gray-400 mt-4 italic text-center">
       *Phí vận chuyển được tính dựa trên khoảng cách thực tế đến cửa hàng.
    </p>
  </div>
</template>
