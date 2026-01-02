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
  isLoading.value = true
  try {
    const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone, // ⭐️ Gửi phone lên
        password: formData.password
    }
    await auth.register(payload)
    toast.show({
        type: 'success',
        message: 'Đăng ký thành công!',
      })
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    toast.show({
        type: 'error',
        message: 'Lỗi đăng ký: ' + err.message
      })
  }
  finally {
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

      <div class="relative">
        <label for="register_password" class="block text-sm font-medium mb-1">Mật khẩu</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          id="register_password"
          v-model.trim="formData.password"
          required
          minlength="6"
          class="w-full border rounded-lg px-3 py-2 pr-10 focus:ring focus:ring-green-300 outline-none dark:bg-gray-700 dark:border-gray-600"
          placeholder="Tối thiểu 6 ký tự"
        />
        <button
          type="button"
          class="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
          @click="showPassword = !showPassword"
          tabindex="-1"
        >
          <span v-if="showPassword">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          </span>
          <span v-else>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </span>
        </button>
      </div>

      <div>
        <label for="confirm-password" class="block text-sm font-medium mb-1"
          >Xác nhận Mật khẩu</label
        >
        <input
          :type="showPassword ? 'text' : 'password'"
          id="confirm-password"
          v-model.trim="formData.confirmPassword"
          required
          minlength="6"
          class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-green-300 outline-none dark:bg-gray-700 dark:border-gray-600"
          placeholder="Nhập lại mật khẩu"
        />
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
