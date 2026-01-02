<script setup>
import { onMounted, computed } from 'vue'
import { usePaymentMethodStore } from '@/stores/paymentMethod'
import { storeToRefs } from 'pinia'

const selectedMethod = defineModel()

const paymentStore = usePaymentMethodStore()
const { activeMethods, loading } = storeToRefs(paymentStore)

// --- TẠO LIST KẾT HỢP API + HARDCODE ---
const select = (method) => {
    selectedMethod.value = method
}

</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
    <div class="text-xl font-semibold mb-4 border-b pb-2">
      <h2 class="border-l-4 border-green-500 pl-2">Phương thức thanh toán</h2>
    </div>

    <div v-if="loading" class="text-gray-500 text-sm animate-pulse">Đang tải phương thức...</div>

    <div v-else-if="activeMethods.length === 0" class="py-4 text-center text-red-500">
        Chưa có phương thức thanh toán nào khả dụng.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="method in activeMethods"
        :key="method.id"
        @click="select(method)"
        class="relative flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
        :class="selectedMethod?.id === method.id
            ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700'"
      >
        <div class="flex items-center h-5">
          <input
            type="radio"
            :checked="selectedMethod?.id === method.id"
            class="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
          />
        </div>

        <div class="ml-4 flex items-center flex-1">
            <img
                :src="method.imageUrl || '/default-payment.png'"
                class="w-10 h-10 object-contain mr-4 bg-white rounded border border-gray-100"
                alt="Icon"
            />
            <div>
                <p class="font-bold text-gray-800 dark:text-white text-sm">
                    {{ method.name }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {{ method.description || 'Thanh toán an toàn, tiện lợi' }}
                </p>
                <p v-if="method.processingFee > 0" class="text-xs text-orange-600 mt-1 font-medium">
                    Phí giao dịch: {{ method.processingFee.toLocaleString() }}đ
                </p>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
