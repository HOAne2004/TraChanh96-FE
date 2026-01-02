<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// Components
import DarkMode from '@/components/common/DarkMode.vue'
import NotificationDropdown from '@/components/customer/NotificationDropdown.vue' // Reuse component

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// Helper hiển thị Avatar
const userAvatar = computed(() => {
  return user.value?.avatar || `https://ui-avatars.com/api/?name=${user.value?.fullName || 'Admin'}&background=10b981&color=fff`
})

const handleLogout = async () => {
  await userStore.logoutAction()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-end px-6 transition-colors duration-300">

    <div class="flex items-center gap-4 md:gap-6">
      <DarkMode />

      <div class="relative">
        <NotificationDropdown :is-admin="true" />
      </div>

      <div class="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
        <div class="text-right hidden md:block">
          <p class="text-sm font-bold text-gray-800 dark:text-white leading-tight">
            {{ user?.fullName || 'Administrator' }}
          </p>
          <p class="text-[10px] text-gray-500 uppercase font-semibold">
            {{ user?.role || 'Quản trị viên' }}
          </p>
        </div>

        <div class="group relative">
          <button class="flex items-center focus:outline-none">
            <img
              :src="userAvatar"
              alt="Avatar"
              class="w-9 h-9 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 group-hover:border-green-500 transition-colors"
            />
          </button>

          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 md:hidden">
               <p class="text-sm font-bold text-gray-800 dark:text-white">{{ user?.fullName }}</p>
            </div>
            <router-link to="/admin/settings/profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Thông tin cá nhân
            </router-link>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
