<script setup>
import { useModalStore } from '@/stores/modal'
import { useRouter, useRoute } from 'vue-router'
import LoginForm from './LoginForm.vue'

const modal = useModalStore()
const router = useRouter()
const route = useRoute()

// Chuyển sang trang Đăng ký
const goToRegisterPage = () => {
    modal.closeLoginModal()
    const currentPath = route.fullPath
    const redirectQuery = (currentPath !== '/' && !currentPath.includes('/login'))
        ? { redirect: currentPath }
        : {}

    router.push({
        path: '/register',
        query: redirectQuery
    })
}

// Chuyển sang trang Quên mật khẩu
const goToForgotPassword = () => {
    modal.closeLoginModal()
    router.push('/forgot-password')
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="modal.isLoginModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999]"
      @click.self="modal.closeLoginModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-scale-in">
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          @click="modal.closeLoginModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Chào mừng trở lại</h2>
          <p class="text-gray-500 text-sm">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <LoginForm @forgot-password="goToForgotPassword" />

        <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-sm">
          <p class="text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?
            <button @click="goToRegisterPage" class="text-green-600 font-bold hover:underline ml-1">
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
