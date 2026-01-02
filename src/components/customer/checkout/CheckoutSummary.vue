<script setup>
import { ref } from 'vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  subtotal: Number,
  shippingFee: Number,
  discountAmount: Number, // Thêm props giảm giá
  total: Number,
  cartIsEmpty: Boolean,
  orderLoading: Boolean,
  formatCurrency: Function,
})

const emit = defineEmits(['place-order', 'apply-voucher']) // Thêm emit apply-voucher

const voucherCode = ref('')

const handleApplyVoucher = () => {
    if(voucherCode.value.trim()) {
        emit('apply-voucher', voucherCode.value)
    }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow sticky top-24">
    <div class="text-xl font-semibold mb-4 border-b pb-2">
      <h2 class="border-l-4 border-green-500 pl-2">Tổng kết</h2>
    </div>

    <div class="mb-4 flex gap-2">
        <input
            v-model="voucherCode"
            type="text"
            placeholder="Mã giảm giá"
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm dark:text-gray-500 focus:ring-2 focus:ring-green-500 outline-none uppercase"
        />
        <button
            @click="handleApplyVoucher"
            class="bg-yellow-200 hover:bg-yellow-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition"
        >
            Áp dụng
        </button>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Tạm tính:</span>
        <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
      </div>
      <div class="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Phí giao hàng:</span>
        <span class="font-medium">{{ formatCurrency(shippingFee) }}</span>
      </div>
      <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
        <span>Voucher giảm:</span>
        <span class="font-medium">-{{ formatCurrency(discountAmount) }}</span>
      </div>
    </div>

    <div class="border-t my-3 dark:border-gray-700"></div>

    <div class="flex justify-between font-bold text-xl items-center">
      <span>TỔNG CỘNG:</span>
      <span class="text-red-600 dark:text-red-400">{{ formatCurrency(total) }}</span>
    </div>

    <Button
      @click="$emit('place-order')"
      :disabled="orderLoading || cartIsEmpty"
      :label="orderLoading ? 'Đang xử lý...' : 'ĐẶT HÀNG'"
      variant="primary"
      size="lg"
      class="mt-6 w-full shadow-lg hover:shadow-xl transition-all"
    />
  </div>
</template>
