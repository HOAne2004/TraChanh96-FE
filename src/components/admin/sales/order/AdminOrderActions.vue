<script setup>
import { ref, computed } from 'vue'
import { ORDER_STATUS } from '@/constants/order.constants'
import { formatPrice } from '@/utils/formatters' // Nhớ import formatPrice

const props = defineProps({
  order: { type: Object, required: true },
  shipperOptions: { type: Array, default: () => [] },
  isProcessing: { type: Boolean, default: false },
})

const emit = defineEmits(['update-status', 'assign-shipper', 'cancel', 'confirm-payment', 'verify-pickup'])
const selectedShipperId = ref('')
const pickupCodeInput = ref('')

// Helper xác định đơn COD
const isCOD = computed(() => {
  if (!props.order.paymentMethod) return false
  const type = props.order.paymentMethod.paymentType.toLowerCase()
  const name = props.order.paymentMethod.name?.toLowerCase() || ''
  return type === 'cod' || name.includes('cod')
})

const onUpdateStatus = (status) => emit('update-status', status)

const onAssignShipper = () => {
  if (selectedShipperId.value) emit('assign-shipper', selectedShipperId.value)
}

// Xử lý xác nhận tiền thủ công
const onManualConfirmPayment = () => {
  emit('confirm-payment')
}

const onVerifyPickup = () => {
  if (pickupCodeInput.value) emit('verify-pickup', pickupCodeInput.value)
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Xử lý đơn hàng</h3>

    <div class="flex flex-col gap-3">
      <button
        v-if="!order.isPaid && order.status !== ORDER_STATUS.CANCELLED && !isCOD"
        @click="onManualConfirmPayment"
        :disabled="isProcessing"
        class="w-full py-2.5 bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Xác nhận đã nhận tiền ({{ formatPrice(order.grandTotal) }})
      </button>

      <button
        v-if="order.status === ORDER_STATUS.NEW"
        @click="onUpdateStatus(ORDER_STATUS.CONFIRMED)"
        :disabled="isProcessing"
        class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Xác nhận đơn hàng
      </button>

      <button
        v-if="order.status === ORDER_STATUS.CONFIRMED"
        @click="onUpdateStatus(ORDER_STATUS.PREPARING)"
        :disabled="isProcessing"
        class="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
        </svg>
        Bắt đầu pha chế
      </button>

      <div v-if="order.status === ORDER_STATUS.PREPARING">
        <div
          class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div v-if="order.orderType === 'delivery'" class="space-y-3">
            <div
              class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
            <h2 class="text-green-600 font-semibold">Giao hàng</h2>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block"
                >Chọn Shipper</label
              >
              <div class="flex gap-2">
                <select
                  v-model="selectedShipperId"
                  class="flex-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-green-500"
                >
                  <option value="" disabled>-- Chọn nhân viên --</option>
                  <option v-for="s in shipperOptions" :key="s.id" :value="s.id">
                    {{ s.username }} <span v-if="s.phone"> ({{ s.phone }})</span>
                  </option>
                </select>
                <button
                  @click="onAssignShipper"
                  :disabled="!selectedShipperId || isProcessing"
                  class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Gán
                </button>
              </div>
            </div>
          </div>

          <div
            v-else-if="order.orderType === 'pickup'"
            class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <label class="text-xs font-bold text-green-700 dark:text-green-300 mb-2 block uppercase">
              Xác thực khách nhận
            </label>
            <div class="flex gap-2">
              <input
                v-model="pickupCodeInput"
                type="text"
                placeholder="Nhập mã (VD: 839201)"
                class="flex-1 text-sm border-gray-300 rounded px-2 py-1 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                @click="onVerifyPickup"
                :disabled="!pickupCodeInput || isProcessing"
                class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors font-bold"
              >
                Xác thực
              </button>
            </div>
            <p class="text-[10px] text-green-500 mt-1 italic">
              *Hỏi khách mã lấy đồ trên ứng dụng của họ
            </p>
          </div>
        </div>
      </div>

      <button
        v-if="order.status === ORDER_STATUS.DELIVERING"
        @click="onUpdateStatus(ORDER_STATUS.COMPLETED)"
        :disabled="isProcessing"
        class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        <span v-if="!order.isPaid && isCOD">Đã thu tiền & Giao thành công</span>
        <span v-else>Đã giao thành công</span>
      </button>

      <button
        v-if="
          [
            ORDER_STATUS.NEW,
            ORDER_STATUS.PENDING_PAYMENT,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PREPARING,
          ].includes(order.status)
        "
        @click="emit('cancel')"
        :disabled="isProcessing"
        class="w-full py-2.5 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
      >
        Hủy đơn hàng
      </button>

      <div
        v-if="order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.RECEIVED"
        class="w-full py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg font-bold text-center flex justify-center items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span v-if="order.status === ORDER_STATUS.RECEIVED">Đã nhận hàng tại quầy</span>
        <span v-else>Đơn hàng đã hoàn tất</span>
      </div>
    </div>
  </div>
</template>
