<script setup>
import { ref, watch } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import authService from '@/services/auth.service'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const currentView = ref('login')
const resendLoading = ref(false)
const resendSuccess = ref('')

// 🟢 STATE CHO 6 Ô OTP
const otpArray = ref(['', '', '', '', '', ''])
const inputRefs = ref([]) // Dùng để bắt focus (nhảy ô) tự động

const modal = useModalStore()
const auth = useUserStore()
const cart = useCartStore()

const emit = defineEmits(['forgot-password'])

watch(email, () => {
  if (currentView.value === 'login') {
    auth.error = null
    resendSuccess.value = ''
  }
})

// --- 🟢 LOGIC XỬ LÝ 6 Ô NHẬP MÃ ---
const handleOtpInput = (e, index) => {
  const val = e.target.value
  // Chỉ cho phép nhập số
  if (!/^\d$/.test(val)) {
    otpArray.value[index] = ''
    return
  }
  // Tự động nhảy sang ô tiếp theo
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handleOtpKeydown = (e, index) => {
  // Nhấn Backspace khi ô hiện tại trống -> lùi về focus ô trước đó
  if (e.key === 'Backspace' && !otpArray.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handleOtpPaste = (e) => {
  e.preventDefault()
  // Lấy dữ liệu copy, loại bỏ chữ, chỉ lấy 6 số đầu tiên
  const pastedData = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (pastedData) {
    pastedData.split('').forEach((char, i) => {
      otpArray.value[i] = char
    })
    // Focus vào ô cuối cùng
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.value[nextIndex]?.focus()
  }
}

// --- LOGIC GỌI API ---
const handleLogin = async () => {
  isLoading.value = true
  auth.error = null
  resendSuccess.value = ''

  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    await Promise.all([auth.fetchUserProfile(), cart.fetchCart()])
    modal.closeLoginModal()
  } catch (err) {
    const msg = auth.error || ''
    if (msg.toLowerCase().includes('xác thực') || msg.toLowerCase().includes('kiểm tra email')) {
      currentView.value = 'verify'
      auth.error = null
      // Reset sạch 6 ô OTP
      otpArray.value = ['', '', '', '', '', '']
    }
  } finally {
    isLoading.value = false
  }
}

const handleVerifyOtp = async () => {
  // Gộp 6 ô lại thành 1 chuỗi để gửi API
  const otpCode = otpArray.value.join('')

  if (otpCode.length < 6) {
    auth.error = 'Vui lòng nhập đủ 6 số xác nhận.'
    return
  }

  isLoading.value = true
  auth.error = null

  try {
    await authService.verifyEmail({
      email: email.value.trim(),
      token: otpCode,
    })

    // Nếu API Verify thành công -> Gọi luôn hàm đăng nhập
    await auth.login({ email: email.value.trim(), password: password.value })
    await auth.fetchUserProfile()
    modal.closeLoginModal()
  } catch (err) {
    auth.error = err.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
  } finally {
    isLoading.value = false
  }
}

const handleResendEmail = async () => {
  if (!email.value) return
  resendLoading.value = true
  resendSuccess.value = ''
  auth.error = null

  try {
    await authService.resendVerification({ email: email.value.trim() })
    resendSuccess.value = 'Mã xác thực mới đã được gửi! Vui lòng kiểm tra email.'
  } catch (err) {
    auth.error = err.response?.data?.message || 'Không thể gửi lại mã lúc này.'
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <!-- Error/Success Alerts -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div v-if="auth.error || resendSuccess" class="space-y-2">
        <div
          v-if="auth.error"
          class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm flex items-start gap-3 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 mt-0.5 flex-shrink-0"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium leading-relaxed">{{ auth.error }}</span>
        </div>

        <div
          v-if="resendSuccess"
          class="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl text-sm flex items-start gap-3 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5 mt-0.5 flex-shrink-0"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium leading-relaxed">{{ resendSuccess }}</span>
        </div>
      </div>
    </transition>

    <!-- Login Form -->
    <form v-if="currentView === 'login'" @submit.prevent="handleLogin" class="space-y-5">
      <div class="space-y-1.5">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
          Địa chỉ Email
        </label>
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <input
            v-model="email"
            type="email"
            required
            placeholder="example@mail.com"
            class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex justify-between items-center px-1">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Mật khẩu
          </label>
          <button
            type="button"
            @click="$emit('forgot-password')"
            class="text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model.trim="password"
            required
            placeholder="••••••••"
            class="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <!-- Lucide Eye Icon -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <!-- Lucide Eye Off Icon -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path
                d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
              />
              <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full active:scale-[0.98] bg-green-600 text-white py-3.5 rounded-2xl font-bold transition-all duration-200 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
      >
        <svg
          v-if="isLoading"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span v-else class="flex items-center gap-2">
          Đăng nhập
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    </form>

    <!-- Verify OTP View -->
    <div v-if="currentView === 'verify'" class="space-y-6 animate-in zoom-in-95 duration-300">
      <div class="text-center space-y-2">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Xác thực tài khoản</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi tới email
          <span class="font-bold text-gray-900 dark:text-gray-200 break-all">{{ email }}</span>
        </p>
      </div>

      <div class="flex justify-between gap-2 max-w-xs mx-auto">
        <input
          v-for="(digit, index) in otpArray"
          :key="index"
          :ref="
            (el) => {
              if (el) inputRefs[index] = el
            }
          "
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

      <button
        @click="handleVerifyOtp"
        :disabled="isLoading"
        class="w-full active:scale-[0.98] bg-green-600 text-white py-3.5 rounded-2xl hover:bg-green-700 transition font-bold shadow-lg shadow-green-500/20 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        <svg
          v-if="isLoading"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span v-else>XÁC NHẬN MÃ</span>
      </button>

      <div class="flex justify-between items-center text-sm px-1 pt-2">
        <button
          type="button"
          @click="currentView = 'login'"
          class="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5 transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="group-hover:-translate-x-1 transition-transform"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại
        </button>
        <button
          type="button"
          @click="handleResendEmail"
          :disabled="resendLoading"
          class="text-green-600 hover:text-green-700 font-bold transition-colors disabled:opacity-50"
        >
          {{ resendLoading ? 'Đang gửi...' : 'Gửi lại mã?' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

.animate-in {
  animation: animate-in 0.3s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}
</style>
