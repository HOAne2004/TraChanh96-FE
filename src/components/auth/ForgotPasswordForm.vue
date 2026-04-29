<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/identity/auth.service.js'

const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMsg = ref('')
const router = useRouter()

const handleForgotPassword = async () => {
  if (!email.value) return

  isLoading.value = true
  errorMsg.value = ''
  isSuccess.value = false

  try {
    // Gọi API
    await authService.forgotPassword({ email: email.value })

    // Thành công: Hiển thị thông báo (Bảo mật: Luôn báo thành công dù email có thật hay không)
    isSuccess.value = true
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <form v-if="!isSuccess" @submit.prevent="handleForgotPassword" class="space-y-6">
      <div class="text-center space-y-2 mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Quên mật khẩu?</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
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

      <div class="space-y-2">
        <label
          for="email"
          class="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1"
        >
          Email của bạn
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
            id="email"
            required
            placeholder="example@mail.com"
            class="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
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
        <span v-else class="flex items-center gap-2">
          GỬI LIÊN KẾT ĐẶT LẠI
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

      <div class="text-center mt-2">
        <button
          type="button"
          @click="goToHome"
          class="text-sm font-medium text-gray-500 hover:text-green-600 flex items-center justify-center gap-1.5 transition-colors group mx-auto"
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
          Quay lại trang chủ
        </button>
      </div>
    </form>

    <div v-else class="text-center space-y-6 py-6 animate-in zoom-in-95 duration-500">
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
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Kiểm tra email của bạn</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
          Nếu tài khoản <span class="font-bold text-gray-900 dark:text-gray-200">{{ email }}</span>
          tồn tại trong hệ thống, chúng tôi đã gửi một liên kết để khôi phục mật khẩu.
        </p>
      </div>

      <div class="pt-4 space-y-3">
        <button
          @click="goToHome"
          class="w-full bg-green-600 dark:bg-green-500 dark:text-gray-900 text-white py-3.5 rounded-2xl hover:bg-green-700 transition font-bold shadow-lg"
        >
          Trở về trang chủ
        </button>
        <p class="text-xs text-gray-400">
          Không nhận được email? Kiểm tra thư rác hoặc
          <button @click="isSuccess = false" class="text-green-600 font-bold hover:underline">
            thử lại
          </button>
        </p>
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
</style>
