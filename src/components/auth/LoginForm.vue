<script setup>
import { ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
// import SocialLoginButtons from './SocialLoginButtons.vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const modal = useModalStore()
const auth = useUserStore()
const cart = useCartStore()

const emit = defineEmits(['forgot-password'])

const handleLogin = async () => {
  isLoading.value = true
  try {
    // 1. Đăng nhập
    await auth.login({ email: email.value, password: password.value })

    // 2. Fetch dữ liệu user & giỏ hàng
    await Promise.all([
      auth.fetchUserProfile(),
      cart.fetchCart(), // Đồng bộ giỏ hàng server về local
    ])

    // 3. Đóng modal
    modal.closeLoginModal()
  } catch (err) {
    console.error('Lỗi đăng nhập:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="auth.error"
      class="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-5 h-5"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {{ auth.error }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label
          for="login_email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >Email</label
        >
        <input
          v-model="email"
          type="email"
          id="login_email"
          required
          placeholder="email@example.com"
          class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div>
        <div class="relative">
          <div class="flex justify-between items-center mb-1">
            <label
              for="login_password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Mật khẩu</label
            >
            <button
              type="button"
              @click="$emit('forgot-password')"
              class="text-xs text-green-600 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          <input
            :type="showPassword ? 'text' : 'password'"
            id="login_password"
            v-model.trim="password"
            required
            class="w-full border rounded-lg px-3 py-2 pr-10 focus:ring focus:ring-green-300 outline-none"
            placeholder="Nhập mật khẩu"
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
      </div>
      <button
        type="submit"
        :disabled="auth.loading"
        class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        <span v-if="auth.loading" class="pointer-events-none">Đang đăng nhập...</span>
        <span v-else>Đăng nhập</span>
      </button>
    </form>

    <div class="mt-4 text-center relative">
      <div class="flex items-center my-4">
        <hr class="flex-grow border-gray-300" />
        <span class="px-2 text-sm text-gray-500">HOẶC</span>
        <hr class="flex-grow border-gray-300" />
      </div>
      <!-- <SocialLoginButtons /> -->
    </div>
  </div>
</template>
