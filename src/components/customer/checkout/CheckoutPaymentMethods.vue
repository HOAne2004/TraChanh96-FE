<script setup>
import { onMounted, computed } from 'vue'
import { usePaymentMethodStore } from '@/stores/paymentMethod'
import { storeToRefs } from 'pinia'

// 1. Nhận Props cấu hình (Mặc định cho phép COD)
const props = defineProps({
  allowCod: { type: Boolean, default: true }
})

// 2. Model 2 chiều (Vue 3.4+)
const selectedMethod = defineModel()

const paymentStore = usePaymentMethodStore()
const { activeMethods, loading } = storeToRefs(paymentStore)

// 3. Tự động tải dữ liệu nếu store trống
onMounted(async () => {
  if (activeMethods.value.length === 0) {
    await paymentStore.fetchActiveMethods()
  }
})

// 4. Computed: Lọc danh sách hiển thị
const displayMethods = computed(() => {
  if (!props.allowCod) {
    return activeMethods.value.filter(m => {
       const type = String(m.paymentType).toLowerCase();
       const code = String(m.code || '').toLowerCase();
       // Giữ lại nếu KHÔNG phải là cod/cash
       return type !== 'cod' && code !== 'cod';
    })
  }
  return activeMethods.value
})

const select = (method) => {
  selectedMethod.value = method
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div class="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2">
      <h2 class="border-l-4 border-green-500 pl-2 text-gray-800 dark:text-white">Phương thức thanh toán</h2>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-6 text-gray-500 gap-2">
      <div class="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
      <span class="text-sm">Đang tải phương thức...</span>
    </div>

    <div v-else-if="displayMethods.length === 0" class="py-4 text-center bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-sm">
      <p>⚠️ Không tìm thấy phương thức thanh toán phù hợp.</p>
      <p v-if="!allowCod" class="text-xs mt-1">(Đơn hàng "Đến lấy" chỉ hỗ trợ thanh toán Online)</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="method in displayMethods"
        :key="method.id"
        @click="select(method)"
        class="relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 group"
        :class="
          selectedMethod?.id === method.id
            ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        "
      >
        <div class="shrink-0">
           <img
            v-if="method.imageUrl"
            :src="method.imageUrl"
            class="w-10 h-10 object-contain bg-white rounded border border-gray-100 p-0.5"
            alt="Icon"
          />
          <div v-else class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
             {{ method.paymentType === 1 ? '💵' : '💳' }}
          </div>
        </div>

        <div class="ml-4 flex-1">
          <div class="flex items-center gap-2">
            <p class="font-bold text-gray-800 dark:text-white text-sm">
              {{ method.name }}
            </p>
            <span v-if="method.processingFee > 0" class="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">
               +{{ method.processingFee.toLocaleString() }}đ phí
            </span>
          </div>

          <p class="text-xs text-gray-500 mt-0.5 line-clamp-1 dark:text-gray-400">
            {{ method.description || 'Thanh toán an toàn, tiện lợi' }}
          </p>
        </div>

        <div class="ml-3">
           <div v-if="selectedMethod?.id === method.id" class="text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>
