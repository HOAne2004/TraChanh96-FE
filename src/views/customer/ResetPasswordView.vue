<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModalStore } from '@/stores/system/modal.store'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const modal = useModalStore()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const isLoading = ref(false)
const errorMsg = ref('')
const isSuccess = ref(false)

// Lấy token từ URL khi trang vừa load
onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token
  } else {
    errorMsg.value = 'Liên kết không hợp lệ hoặc bị thiếu Token xác thực.'
  }
})

const handleResetPassword = async () => {
  // Validate cơ bản
  if (!token.value) {
    errorMsg.value = 'Không tìm thấy mã xác thực (Token).'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Mật khẩu phải có ít nhất 6 ký tự.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    await authService.resetPassword({
      token: token.value,
      newPassword: newPassword.value,
    })

    isSuccess.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Liên kết đã hết hạn hoặc không hợp lệ.'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/')
  // Mở modal login lên
  setTimeout(() => {
    if (modal.openLoginModal) modal.openLoginModal()
    else modal.isLoginModalOpen = true
  }, 300)
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <div
      class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div v-if="!isSuccess" class="text-center space-y-2">
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Đặt lại mật khẩu</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
      >
        <div
          v-if="errorMsg"
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
          <span class="font-medium leading-relaxed">{{ errorMsg }}</span>
        </div>
      </transition>

      <form v-if="!isSuccess && token" @submit.prevent="handleResetPassword" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
            Mật khẩu mới
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model.trim="newPassword"
              required
              placeholder="Nhập mật khẩu mới"
              class="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
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

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
            Xác nhận mật khẩu
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model.trim="confirmPassword"
              required
              placeholder="Nhập lại mật khẩu mới"
              class="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full active:scale-[0.98] bg-green-600 text-white py-4 rounded-2xl font-bold transition-all duration-200 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
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
          <span v-else>XÁC NHẬN ĐỔI MẬT KHẨU</span>
        </button>
      </form>

      <div v-if="isSuccess" class="text-center space-y-6 py-6 animate-in zoom-in-95 duration-500">
        <div
          class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/30 mb-2 border-4 border-white dark:border-gray-800 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Thành công!</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu
            mới.
          </p>
        </div>
        <button
          @click="goToLogin"
          class="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-2xl hover:bg-gray-800 transition font-bold shadow-lg"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.5s ease-out;
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
input[type='password']::-ms-reveal,
input[type='password']::-ms-clear {
  display: none;
}
</style>
