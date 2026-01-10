<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  show: Boolean,
  order: { type: Object, required: true },
})

const emit = defineEmits(['close'])
const toastStore = useToastStore()

// Tạo link QR VietQR động
const qrCodeUrl = computed(() => {
  if (!props.order || !props.order.paymentMethod) return ''

  const { bankName, bankAccountNumber, bankAccountName, qrTplUrl } = props.order.paymentMethod
  // Template QR: compact2, print, v.v. (Mặc định compact2)
  const template = qrTplUrl || 'compact2'

  // Tạo URL: https://img.vietqr.io/image/<BANK>-<ACC>-<TEMPLATE>.png
  return `https://img.vietqr.io/image/${bankName}-${bankAccountNumber}-${template}.png?amount=${props.order.grandTotal}&addInfo=${props.order.orderCode}&accountName=${encodeURIComponent(bankAccountName)}`
})

const copyToClipboard = (text, label) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toastStore.show({ type: 'success', message: `Đã sao chép ${label}!` })
}

const handleConfirmClick = () => {
  // Emit sự kiện confirm để cha xử lý (reload/toast)
  emit('close')
  emit('confirm') // Thêm sự kiện này
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all">
    <div
      class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <div
      class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up"
    >
      <div
        class="md:w-5/12 bg-gray-50 dark:bg-gray-700/50 p-6 flex flex-col border-r border-gray-100 dark:border-gray-700"
      >
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Thanh toán đơn hàng</h3>
          <p class="text-sm text-gray-500">
            Mã đơn: <span class="font-mono font-bold">#{{ order.orderCode }}</span>
          </p>
        </div>

        <div class="flex-1 space-y-4">
          <div
            class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 text-center"
          >
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng tiền</p>
            <p class="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {{ formatPrice(order.grandTotal) }}
            </p>
          </div>

          <div class="space-y-3">
            <div
              class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <p class="text-xs text-gray-500">Ngân hàng</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ order.paymentMethod?.bankName }}
              </p>
            </div>

            <div
              class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-500 transition-colors group relative"
              @click="copyToClipboard(order.paymentMethod?.bankAccountNumber, 'Số tài khoản')"
            >
              <p class="text-xs text-gray-500">Số tài khoản (Chạm để sao chép)</p>
              <p class="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                {{ order.paymentMethod?.bankAccountNumber }}
              </p>
              <span class="absolute right-3 top-3 text-gray-400 group-hover:text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>

            <div
              class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <p class="text-xs text-gray-500">Chủ tài khoản</p>
              <p class="font-bold text-gray-900 dark:text-white uppercase">
                {{ order.paymentMethod?.bankAccountName }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="md:w-7/12 p-6 flex flex-col items-center justify-center bg-white dark:bg-gray-800 relative"
      >
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="text-center mb-4">
          <h4 class="text-lg font-bold text-gray-800 dark:text-white mb-1">
            Quét mã QR để thanh toán
          </h4>
          <p class="text-sm text-gray-500">Sử dụng App Ngân hàng hoặc Ví điện tử</p>
        </div>

        <div class="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <img :src="qrCodeUrl" alt="VietQR" class="w-56 h-56 object-contain rounded-lg" />
        </div>

        <div class="mt-6 w-full px-4">
          <div
            class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-lg border border-yellow-200 dark:border-yellow-700 flex items-start gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="flex-1">
              <p class="mb-1">Nội dung chuyển khoản bắt buộc:</p>
              <div
                class="font-mono bg-white dark:bg-black px-3 py-1.5 rounded border border-yellow-300 font-bold text-center cursor-pointer hover:bg-yellow-100 transition-colors flex justify-between items-center"
                @click="copyToClipboard(order.orderCode, 'Nội dung chuyển khoản')"
              >
                <span>{{ order.orderCode }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-center">
            <Button
              label="Tôi đã chuyển khoản xong"
              variant="primary"
              class="w-full py-3 text-base"
              @click="handleConfirmClick"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
