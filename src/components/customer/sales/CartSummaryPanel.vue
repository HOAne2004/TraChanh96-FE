<script setup>
import { computed } from 'vue'
import Button from '@/components/ui/AppButton.vue'

const props = defineProps({
  total: { type: Number, required: true },
  hasItems: { type: Boolean, required: true },
  isLoggedIn: { type: Boolean, required: true },
})

const emit = defineEmits(['checkout'])

// Format tiền
const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

const checkoutLabel = computed(() => {
  return props.isLoggedIn ? 'THANH TOÁN NGAY' : 'ĐĂNG NHẬP ĐỂ THANH TOÁN'
})
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow h-fit dark:bg-gray-600 sticky top-24">
    <h3 class="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
    <div class="border-t my-3 dark:border-gray-500"></div>
    <div class="flex justify-between font-bold text-lg text-green-700 dark:text-green-300">
      <span>Tổng cộng:</span>
      <span>{{ formatCurrency(total) }}</span>
    </div>

    <!-- Nút Thanh toán -->
    <Button
      @click="emit('checkout')"
      :disabled="!hasItems"
      :label="checkoutLabel"
      variant="primary"
      size="lg"
      class="mt-6 w-full"
    />

    <p v-if="!isLoggedIn" class="mt-3 text-center text-sm text-red-500 dark:text-red-400">
      Bạn cần đăng nhập để tiến hành thanh toán.
    </p>
  </div>
</template>
