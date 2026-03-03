<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modal'
import authService from '@/services/auth.service'
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const modal = useModalStore()

const loading = ref(true)
const success = ref(false)
const message = ref('Đang xác thực thông tin...')

onMounted(async () => {
  const { email, token } = route.query

  if (!email || !token) {
    loading.value = false
    success.value = false
    message.value = 'Đường dẫn xác thực không hợp lệ hoặc bị thiếu thông tin.'
    return
  }

  try {
    await authService.verifyEmail({
      email: email,
      token: token,
    })

    success.value = true
    message.value = 'Xác thực tài khoản thành công! Bây giờ bạn có thể đăng nhập.'
  } catch (err) {
    success.value = false
    message.value =
      err.response?.data?.message || 'Xác thực thất bại. Token có thể đã không đúng hoặc hết hạn.'
  } finally {
    loading.value = false
  }
})

const goToLogin = async () => {
  await router.push('/')

  if (modal.openLoginModal) {
    modal.openLoginModal()
  } else {
    modal.isLoginModalOpen = true
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div
      class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100"
    >
      <div v-if="loading" class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6"
        >
          <svg
            class="animate-spin h-8 w-8 text-blue-600"
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
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Đang xác thực...</h2>
        <p class="mt-2 text-gray-500">Vui lòng chờ trong giây lát.</p>
      </div>

      <div v-else-if="success" class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
        >
          <CheckCircleIcon class="h-10 w-10 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Thành công!</h2>
        <p class="mt-2 text-gray-600">{{ message }}</p>

        <div class="mt-8">
          <button
            @click="goToLogin"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Đến trang Đăng nhập
            <ArrowRightIcon class="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      <div v-else class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6"
        >
          <XCircleIcon class="h-10 w-10 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Xác thực thất bại</h2>
        <p class="mt-2 text-red-600 font-medium">{{ message }}</p>
        <p class="mt-1 text-sm text-gray-500">Vui lòng kiểm tra lại email hoặc yêu cầu mã mới.</p>

        <div class="mt-8">
          <button
            @click="goToLogin"
            class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
