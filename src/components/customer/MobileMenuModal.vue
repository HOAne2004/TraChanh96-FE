<script setup>
import { computed } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import NavLink from '@common/NavLink.vue'

const modalStore = useModalStore()
const userStore = useUserStore()
const cartStore = useCartStore()

// Lấy trạng thái cần thiết
const { isMobileMenuOpen } = storeToRefs(modalStore)
const { isLoggedIn, user } = storeToRefs(userStore)
const { totalQuantity } = storeToRefs(cartStore)

// Hành động
const closeMenu = () => modalStore.closeMobileMenu()
const openLogin = () => {
  closeMenu()
  modalStore.openLoginModal()
}
const handleLogout = () => {
  userStore.signOut()
  closeMenu()
}

// Danh sách NavLinks
const navLinks = computed(() => {
  // Giá trị totalQuantity.value được truy cập trong computed function
  // Nó đảm bảo rằng nó có thể phản ứng với sự thay đổi,
  // và khi lần đầu được chạy, Vue đã setup xong các ref.
  const cartLabel = `Giỏ hàng (${totalQuantity.value})`

  return [
    { to: '/', label: 'Trang chủ' },
    { to: '/products', label: 'Sản phẩm' },
    { to: '/aboutUs', label: 'Về chúng tôi' },
    { to: '/news', label: 'Tin tức' },
    { to: '/cart', label: cartLabel, icon: 'cart' },
  ]
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="isMobileMenuOpen"
      @click="closeMenu"
      class="fixed inset-0 bg-black/50 z-[90] sm:hidden"
    ></div>
  </transition>

  <transition name="slide-right">
    <div
      v-if="isMobileMenuOpen"
      class="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-[100] sm:hidden flex flex-col"
    >
      <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <div v-if="isLoggedIn" class="text-sm">
          <p class="font-semibold text-green-600 dark:text-green-400">Xin chào,</p>
          <p class="truncate">{{ user.name }}</p>
        </div>
        <button
          v-else
          @click="openLogin"
          class="bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700 transition"
        >
          Đăng nhập
        </button>

        <button
          @click="closeMenu"
          class="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :label="link.label"
          class="block w-full py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          @click="closeMenu"
        >
          <span v-if="link.icon === 'cart'" class="inline-flex items-center gap-2">
            {{ link.label.split(' ')[0] }}
            <span
              v-if="totalQuantity > 0"
              class="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
            >
              {{ totalQuantity }}
            </span>
          </span>
        </NavLink>
      </nav>

      <div class="p-4 border-t dark:border-gray-700">
        <button
          v-if="isLoggedIn"
          @click="handleLogout"
          class="w-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-red-100 transition"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Transition cho Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transition cho Sidebar */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}
</style>
