<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import ProfileSidebar from '@/components/customer/profile/ProfileSidebar.vue'

const modalStore = useModalStore()
const userStore = useUserStore()
const { user, isLoggedIn } = storeToRefs(userStore)

const isMenuOpen = ref(false)
const menuRef = ref(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogin = () => {
  modalStore.openLoginModal()
  closeMenu()
}

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) closeMenu()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="menuRef" class="relative">
    <!-- ✅ Nút chính -->
    <button
      v-if="!isLoggedIn"
      @click="handleLogin"
      class="flex items-center gap-2 px-3 py-2 rounded-full bg-green-600 text-white text-sm font-medium transition hover:bg-green-700 focus:ring-2 focus:ring-green-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
        />
      </svg>
      <span>Đăng nhập</span>
    </button>

    <!-- ✅ Khi đã đăng nhập -->
    <div v-else>
      <button
        @click="toggleMenu"
        class="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-800 shadow-sm': isMenuOpen }"
      >
        <img
          v-if="user?.thumbnailUrl"
          :src="user.thumbnailUrl"
          alt="Avatar"
          class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
        >
          <span class="font-bold text-sm">{{ user?.username?.charAt(0).toUpperCase() }}</span>
        </div>

        <div class="hidden lg:block text-left mr-1">
          <p
            class="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none max-w-[100px] truncate"
          >
            {{ user?.username || 'Khách' }}
          </p>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 text-gray-500 transition-transform duration-200"
          :class="{ 'rotate-180': isMenuOpen }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
        v-if="isMenuOpen"
        class="absolute right-0 mt-2 w-72 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <ProfileSidebar
            :user="user"
            :is-dropdown="true"
            @close="closeMenu"
        />
      </div>
      </Transition>
    </div>
  </div>
</template>
