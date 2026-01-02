<script setup>
import { ref } from 'vue'
import authService from '@/services/auth.service' // Gọi trực tiếp service cho gọn

const email = ref('')
const message = ref('')
const error = ref('')
const isLoading = ref(false)

const handleForgotPassword = async () => {
  isLoading.value = true
  message.value = ''
  error.value = ''

  try {
    // API: POST /Auth/forgot-password { email: ... }
    await authService.forgotPassword({ email: email.value })

    message.value = '✅ Yêu cầu đã được gửi! Vui lòng kiểm tra Email của bạn để lấy lại mật khẩu.'
    email.value = '' // Reset form
  } catch (err) {
    error.value = err.response?.data?.message || 'Không tìm thấy tài khoản với email này.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
    <h2 class="text-2xl font-bold mb-4 text-center">Khôi phục mật khẩu</h2>
    <p class="text-gray-500 text-sm text-center mb-6">
        Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
    </p>

    <div v-if="message" class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">
        {{ message }}
    </div>
    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
        {{ error }}
    </div>

    <form @submit.prevent="handleForgotPassword" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="email@example.com"
        >
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50"
      >
        {{ isLoading ? 'Đang gửi...' : 'Gửi yêu cầu' }}
      </button>
    </form>

    <div class="mt-6 text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-green-600 flex items-center justify-center gap-1">
            ← Quay lại trang chủ
        </router-link>
    </div>
  </div>
</template>
