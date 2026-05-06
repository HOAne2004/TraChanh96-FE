<script setup>
import { ref } from 'vue'
import authService from '@/services/identity/auth.service'

const props = defineProps({
  email: { type: String, required: true },
  /** Error message từ parent (vd: lỗi login sau khi verify) */
  externalError: { type: String, default: '' },
})

const emit = defineEmits([
  'verified',   // Đã verify OTP thành công, trả về { email, otp }
  'back',       // Người dùng bấm Quay lại
])

const otpArray   = ref(['', '', '', '', '', ''])
const inputRefs  = ref([])
const isLoading  = ref(false)
const localError = ref('')
const resendLoading  = ref(false)
const resendSuccess  = ref('')

// --- OTP input helpers ---
const handleOtpInput = (e, index) => {
  const val = e.target.value
  if (!/^\d$/.test(val)) {
    otpArray.value[index] = ''
    return
  }
  if (val && index < 5) inputRefs.value[index + 1]?.focus()
}

const handleOtpKeydown = (e, index) => {
  if (e.key === 'Backspace' && !otpArray.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handleOtpPaste = (e) => {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (pastedData) {
    pastedData.split('').forEach((char, i) => { otpArray.value[i] = char })
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.value[nextIndex]?.focus()
  }
}

// --- Submit OTP ---
const handleVerify = async () => {
  const otpCode = otpArray.value.join('')
  if (otpCode.length < 6) {
    localError.value = 'Vui lòng nhập đủ 6 số xác nhận.'
    return
  }

  isLoading.value  = true
  localError.value = ''

  try {
    await authService.verifyEmail({ email: props.email, token: otpCode })
    emit('verified', { email: props.email, otp: otpCode })
  } catch (err) {
    localError.value = err.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
  } finally {
    isLoading.value = false
  }
}

// --- Resend email ---
const handleResend = async () => {
  if (!props.email) return
  resendLoading.value = true
  resendSuccess.value = ''
  localError.value    = ''
  try {
    await authService.resendVerification({ email: props.email })
    resendSuccess.value = 'Mã xác thực mới đã được gửi! Vui lòng kiểm tra email.'
  } catch (err) {
    localError.value = err.response?.data?.message || 'Không thể gửi lại mã lúc này.'
  } finally {
    resendLoading.value = false
  }
}

// --- Expose reset để parent có thể gọi khi cần ---
const reset = () => {
  otpArray.value  = ['', '', '', '', '', '']
  localError.value = ''
  resendSuccess.value = ''
}
defineExpose({ reset })
</script>

<template>
  <div class="space-y-6 animate-in zoom-in-95 duration-300">
    <!-- Title -->
    <div class="text-center space-y-2">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Xác thực tài khoản</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi tới email <br />
        <span class="font-bold text-gray-900 dark:text-gray-200 break-all">{{ email }}</span>
      </p>
    </div>

    <!-- Alerts -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
    >
      <div v-if="localError || externalError || resendSuccess" class="space-y-2">
        <div
          v-if="localError || externalError"
          class="bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl text-sm flex items-start gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mt-0.5 shrink-0">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium leading-relaxed">{{ localError || externalError }}</span>
        </div>
        <div
          v-if="resendSuccess"
          class="bg-green-50 border border-green-100 text-green-600 p-3 rounded-2xl text-sm flex items-start gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mt-0.5 shrink-0">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium leading-relaxed">{{ resendSuccess }}</span>
        </div>
      </div>
    </transition>

    <!-- 6-digit OTP inputs -->
    <div class="flex justify-between gap-2 max-w-xs mx-auto">
      <input
        v-for="(digit, index) in otpArray"
        :key="index"
        :ref="(el) => { if (el) inputRefs[index] = el }"
        v-model="otpArray[index]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        @input="handleOtpInput($event, index)"
        @keydown="handleOtpKeydown($event, index)"
        @paste="handleOtpPaste"
        class="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all dark:text-white shadow-sm"
      />
    </div>

    <!-- Submit button -->
    <button
      @click="handleVerify"
      :disabled="isLoading"
      class="w-full active:scale-[0.98] bg-green-600 text-white py-3.5 rounded-2xl hover:bg-green-700 transition font-bold shadow-lg shadow-green-500/20 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span v-else>XÁC NHẬN MÃ</span>
    </button>

    <!-- Back + Resend -->
    <div class="flex justify-between items-center text-sm px-1 pt-2">
      <button
        type="button"
        @click="emit('back')"
        class="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Quay lại
      </button>
      <button
        type="button"
        @click="handleResend"
        :disabled="resendLoading"
        class="text-green-600 hover:text-green-700 font-bold transition-colors disabled:opacity-50"
      >
        {{ resendLoading ? 'Đang gửi...' : 'Gửi lại mã?' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.3s ease-out;
}
@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
