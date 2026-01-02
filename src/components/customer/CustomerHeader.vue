<script setup>
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

// Stores
import { useCartStore } from '@/stores/cart'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

// Components
import SearchBar from '@customer/SearchBar.vue'
import NavLink from '@common/NavLink.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import logoHeader from '@logo/favicon.png'
import Button from '@common/Button.vue'
import ProfileMenu from '@customer/profile/ProfileMenu.vue'
// 👇 Import component chuông thông báo (Đường dẫn tùy nơi bạn lưu file)
import NotificationDropdown from '@/components/customer/NotificationDropdown.vue'

const cartStore = useCartStore()
const userStore = useUserStore()
const modalStore = useModalStore()
const notificationStore = useNotificationStore()

const { totalItems } = storeToRefs(cartStore)
const { isLoggedIn } = storeToRefs(userStore)

// --- LOGIC SIGNALR & NOTIFICATION ---
const initNotificationSystem = async () => {
  if (isLoggedIn.value) {
    await notificationStore.fetchNotifications() // Lấy danh sách cũ
    await notificationStore.initSignalR()        // Kết nối realtime
  }
}

onMounted(() => {
  initNotificationSystem()
})

// Theo dõi trạng thái đăng nhập để bật/tắt kết nối
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    initNotificationSystem()
  } else {
    notificationStore.stopSignalR()
  }
})
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md px-4 py-3"
  >
    <div
      class="flex justify-between items-center gap-3 sm:grid sm:grid-cols-[auto_3fr_2fr_auto] sm:gap-4 md:gap-6"
    >
      <RouterLink to="/" class="flex justify-start items-center gap-2">
        <img class="h-9 sm:h-10 md:h-12" :src="logoHeader" alt="Logo Trà Chanh 1996" />
        <span class="hidden lg:inline font-bold text-primary text-lg font-[cursive] tracking-wide"
          >Trà chanh 1996</span
        >
      </RouterLink>

      <nav class="hidden sm:flex items-center justify-center gap-x-8 text-sm md:text-base">
        <NavLink to="/" label="Trang chủ" />
        <NavLink to="/products" label="Sản phẩm" />
        <NavLink to="/aboutUs" label="Về chúng tôi" />
        <NavLink to="/news" label="Tin tức" />
        <NavLink to="/franchise" label="Nhượng quyền" />
      </nav>

      <div class="hidden sm:block w-full sm:w-auto">
        <SearchBar />
      </div>

      <div class="flex justify-end items-center w-full sm:w-auto gap-1 sm:gap-3">

        <NavLink to="/cart" variant="outline" :badge="Number(totalItems)">
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 inline-block"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0
               00-3 3h15.75m-12.75-3h11.218
               c1.121-2.3 2.1-4.684 2.924-7.138
               a60.114 60.114 0 00-16.536-1.84M7.5
               14.25L5.106 5.272M6 20.25a.75.75
               0 11-1.5 0 .75.75 0 011.5 0zm12.75
               0a.75.75 0 11-1.5 0 .75.75
               0 011.5 0z"
              />
            </svg>
          </template>
        </NavLink>

        <div v-if="isLoggedIn" class="relative">
           <NotificationDropdown />
        </div>

        <ProfileMenu />

        <LoginModal />

        <Button
          @click="modalStore.openMobileMenu"
          class="block sm:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </Button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
