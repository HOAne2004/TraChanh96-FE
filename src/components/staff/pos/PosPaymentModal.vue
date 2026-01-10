<script setup>
import { ref, computed, watch } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { storeToRefs } from 'pinia'

import { usePaymentMethodStore } from '@/stores/paymentMethod'
import { PAYMENT_TYPE, PAYMENT_TYPE_UI } from '@/constants/payment.constants'

const props = defineProps({
  isOpen: Boolean,
  totalAmount: { type: Number, required: true },
  orderCode: { type: String, default: '---' },
})

const emit = defineEmits(['close', 'confirm'])

const paymentStore = usePaymentMethodStore()
const { activeMethods } = storeToRefs(paymentStore)

// State local
const selectedMethod = ref(null)
const customerPay = ref(0)
const isProcessing = ref(false)

// --- COMPUTED ---

const isCash = computed(() => {
  return selectedMethod.value?.paymentType === PAYMENT_TYPE.COD
})

const changeAmount = computed(() => {
  if (!isCash.value) return 0
  return Math.max(0, customerPay.value - props.totalAmount)
})

const qrCodeUrl = computed(() => {
  // Nếu là COD (Tiền mặt) -> Không hiện QR
  if (!selectedMethod.value || isCash.value) return ''

  const bankBin = selectedMethod.value.bankName || 'MB'
  const bankNumber = selectedMethod.value.bankAccountNumber || '0000000000'
  const template = selectedMethod.value.qrTpl || 'compact2'

  return `https://img.vietqr.io/image/${bankBin}-${bankNumber}-${template}.png?amount=${props.totalAmount}&addInfo=${props.orderCode}`
})

// --- WATCH ---
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return

    customerPay.value = 0
    isProcessing.value = false

    if (activeMethods.value.length === 0) {
      await paymentStore.fetchActiveMethods()
    }

    selectedMethod.value =
      activeMethods.value.find(m => m.paymentType === PAYMENT_TYPE.COD) ||
      activeMethods.value[0] ||
      null
  },
)

// --- METHODS (Logic bàn phím giữ nguyên) ---
const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num)

const appendNumber = (val) => {
  const str = customerPay.value.toString()
  if (str.length > 11) return

  if (val === '000') {
    if (customerPay.value === 0) return
    customerPay.value = Number(str + '000')
  } else {
    if (customerPay.value === 0) customerPay.value = val
    else customerPay.value = Number(str + val)
  }
}

const backspace = () => {
  const str = customerPay.value.toString()
  if (str.length <= 1) customerPay.value = 0
  else customerPay.value = Number(str.slice(0, -1))
}

const setSuggestion = (amount) => {
  customerPay.value = amount
}

const handleConfirm = () => {
  if (!selectedMethod.value) return
  
  if (isCash.value && customerPay.value < props.totalAmount) {
    alert('Khách đưa chưa đủ tiền!')
    return
  }

  isProcessing.value = true

  emit('confirm', {
    paymentMethodId: selectedMethod.value.id,
    customerPay: isCash.value ? customerPay.value : props.totalAmount,
    change: changeAmount.value,
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div
      class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex h-[650px]"
    >
      <div class="w-5/12 border-r border-gray-100 flex flex-col bg-gray-50">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">Thanh toán</h2>
          <p class="text-sm text-gray-500">
            Đơn hàng <span class="font-mono font-bold text-blue-600">#{{ orderCode }}</span>
          </p>
        </div>

        <div class="flex-1 p-6 space-y-6 overflow-y-auto">
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center">
            <p class="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Tổng tiền phải thu
            </p>
            <p class="text-4xl font-extrabold text-blue-600 mt-2">{{ formatPrice(totalAmount) }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-3"
              >Phương thức thanh toán</label
            >
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="method in activeMethods"
                :key="method.id"
                @click="selectedMethod = method"
                class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group active:scale-[0.98]"
                :class="
                  selectedMethod?.id === method.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-inner'
                    : 'border-white bg-white shadow-sm hover:border-blue-300'
                "
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 bg-white"
                >
                  <img
                    v-if="method.imageUrl"
                    :src="method.imageUrl"
                    class="w-6 h-6 object-contain"
                  />
                  <span v-else class="text-lg">{{
                    PAYMENT_TYPE_UI[method.paymentType]?.icon || '💰'
                  }}</span>
                </div>

                <div>
                  <span
                    class="block font-bold text-sm"
                    :class="selectedMethod?.id === method.id ? 'text-blue-700' : 'text-gray-700'"
                  >
                    {{ method.name }}
                  </span>
                  <span class="text-xs text-gray-400 font-medium">
                    {{ PAYMENT_TYPE_UI[method.paymentType]?.label || 'Khác' }}
                  </span>
                </div>

                <div v-if="selectedMethod?.id === method.id" class="ml-auto text-blue-600">
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
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-7/12 flex flex-col bg-white relative">
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
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

        <div v-if="isCash" class="flex-1 flex flex-col h-full">
          <div class="p-8 flex-1 flex flex-col justify-center">
            <label class="block text-sm font-semibold text-gray-500">Khách đưa</label>
            <div class="relative group">
              <input
                type="text"
                :value="formatNumber(customerPay)"
                readonly
                class="w-full text-right text-5xl font-bold text-gray-800 border-b-2 border-gray-200 py-2 focus:outline-none bg-transparent group-hover:border-blue-400 transition-colors"
                placeholder="0"
              />
              <span
                class="absolute right-0 -bottom-6 text-gray-400 text-xs font-bold tracking-wider"
                >VNĐ</span
              >
            </div>

            <div class="flex gap-2 mt-10">
              <button
                @click="setSuggestion(totalAmount)"
                class="flex-1 py-2 px-3 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Đủ tiền
              </button>
              <button
                v-if="totalAmount < 100000"
                @click="setSuggestion(100000)"
                class="flex-1 py-2 px-3 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                100k
              </button>
              <button
                v-if="totalAmount < 200000"
                @click="setSuggestion(200000)"
                class="flex-1 py-2 px-3 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                200k
              </button>
              <button
                v-if="totalAmount < 500000"
                @click="setSuggestion(500000)"
                class="flex-1 py-2 px-3 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                500k
              </button>
            </div>

            <div
              class="mt-6 p-2 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center transition-all"
              :class="{ 'opacity-50 grayscale': customerPay < totalAmount }"
            >
              <span class="text-green-800 font-bold text-sm">Tiền thừa trả khách</span>
              <span class="text-2xl font-extrabold text-green-700">{{
                formatPrice(changeAmount)
              }}</span>
            </div>

            <p
              v-if="customerPay < totalAmount && customerPay > 0"
              class="text-right text-red-500 text-xs font-bold mt-2 animate-pulse"
            >
              Còn thiếu: {{ formatPrice(totalAmount - customerPay) }}
            </p>
          </div>

          <div
            class="grid grid-cols-3 gap-px bg-gray-200 border-t border-gray-200 h-64 select-none"
          >
            <button
              v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="n"
              @click="appendNumber(n)"
              class="bg-white text-2xl font-bold text-gray-700 hover:bg-gray-50 active:bg-blue-50 active:text-blue-600 transition-colors"
            >
              {{ n }}
            </button>
            <button
              @click="appendNumber('000')"
              class="bg-white text-lg font-bold text-gray-500 hover:bg-gray-50 active:bg-blue-50"
            >
              00
            </button>
            <button
              @click="appendNumber(0)"
              class="bg-white text-2xl font-bold text-gray-700 hover:bg-gray-50 active:bg-blue-50"
            >
              0
            </button>
            <button
              @click="backspace"
              class="bg-white text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              ⌫
            </button>
          </div>
        </div>

        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white"
        >
          <div
            class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6 transform hover:scale-105 transition-transform duration-300"
          >
            <img
              v-if="qrCodeUrl"
              :src="qrCodeUrl"
              class="w-64 h-64 object-contain rounded-lg"
              alt="VietQR Payment"
            />
            <div
              v-else
              class="w-64 h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg text-gray-400 gap-2"
            >
              <span class="text-xs">Thiếu thông tin ngân hàng</span>
            </div>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-bold text-gray-400 uppercase tracking-wide">
              Số tiền thanh toán
            </p>
            <p class="font-extrabold text-3xl text-blue-600">{{ formatPrice(totalAmount) }}</p>
          </div>
          <div class="mt-8 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm max-w-xs">
            Vui lòng kiểm tra thông báo biến động số dư trước khi xác nhận.
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-white">
          <button
            @click="handleConfirm"
            :disabled="isProcessing || (isCash && customerPay < totalAmount)"
            class="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
            :class="
              isProcessing || (isCash && customerPay < totalAmount)
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            "
          >
            <span
              v-if="isProcessing"
              class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
            ></span>
            <span>{{ isCash ? 'Hoàn tất thanh toán' : 'Đã nhận được tiền' }}</span>
            <span
              v-if="isCash && customerPay >= totalAmount"
              class="bg-blue-800 px-2 py-0.5 rounded text-sm"
              >Trả lại: {{ formatPrice(changeAmount) }}</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
