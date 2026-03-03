<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const auth = useUserStore()
const toast = useToastStore()

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const isLoading = ref(false)

const handleRegister = async () => {
  if (formData.password !== formData.confirmPassword) {
    auth.error = 'Mật khẩu và Xác nhận Mật khẩu không khớp.'
    return
  }

  // Validate Email: Phải có @, không chứa dấu cách, có tên miền
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    auth.error = 'Email không đúng định dạng (Ví dụ: user@gmail.com, không chứa dấu cách).'
    return
  }

  // Validate Phone: Đầu số VN 03, 05, 07, 08, 09 hoặc +84... và có 10 số
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/
  if (!formData.phone || !phoneRegex.test(formData.phone)) {
    auth.error = 'Số điện thoại không hợp lệ (Phải đúng chuẩn Việt Nam, VD: 0912345678).'
    return
  }
  isLoading.value = true
  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone, // ⭐️ Gửi phone lên
      password: formData.password,
    }
    await auth.register(payload)
    toast.show({
      type: 'success',
      message: 'Đăng ký thành công!',
    })
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    // toast.show({
    //     type: 'error',
    //     message: 'Lỗi đăng ký: ' + err.message
    //   })
  } finally {
    isLoading.value = false
  }
}

const clearError = () => {
  auth.error = null
}
</script>

<template>
  <div class="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-center">Tạo Tài khoản mới</h2>

    <div
      v-if="auth.error"
      class="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm"
      role="alert"
    >
      <span>{{ auth.error }}</span>
      <button @click="clearError" class="absolute top-0 bottom-0 right-0 px-4" aria-label="Close">
        <span class="font-bold text-xl">&times;</span>
      </button>
    </div>

    <form @submit.prevent="handleRegister" @input="clearError" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium mb-1">Họ tên</label>
        <input
          id="username"
          type="text"
          v-model.trim="formData.username"
          required
          class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none dark:bg-gray-700 dark:border-gray-600"
          placeholder="Tên của bạn"
        />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          type="email"
          inputmode="email"
          v-model.trim="formData.email"
          required
          class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none dark:bg-gray-700 dark:border-gray-600"
          placeholder="Nhập email của bạn"
        />
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium mb-1">Số điện thoại</label>
        <input
          id="phone"
          type="tel"
          v-model.trim="formData.phone"
          required
          class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none dark:bg-gray-700 dark:border-gray-600"
          placeholder="Nhập số điện thoại của bạn"
        />
      </div>

      <div class="space-y-1.5">
        <label
          for="register_password"
          class="block text-sm font-medium mb-1 ml-1 text-gray-700 dark:text-gray-200"
          >Mật khẩu</label
        >
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
            id="register_password"
            v-model.trim="formData.password"
            required
            minlength="6"
            placeholder="Tối thiểu 6 ký tự"
            class="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
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

      <div class="space-y-1.5">
        <label
          for="confirm-password"
          class="block text-sm font-medium mb-1 ml-1 text-gray-700 dark:text-gray-200"
          >Xác nhận Mật khẩu</label
        >
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
            id="confirm-password"
            v-model.trim="formData.confirmPassword"
            required
            minlength="6"
            placeholder="Nhập lại mật khẩu"
            class="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 dark:text-white"
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

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        <span v-if="isLoading" class="pointer-events-none">Đang đăng ký...</span>
        <span v-else>Đăng ký</span>
      </button>
    </form>

    <div class="mt-4 text-center text-sm">
      Đã có tài khoản?
      <RouterLink to="/login" class="text-green-600 hover:underline font-medium">
        Quay lại trang chủ (Đăng nhập)
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
input[type='password']::-ms-reveal,
input[type='password']::-ms-clear {
  display: none;
}
</style>
