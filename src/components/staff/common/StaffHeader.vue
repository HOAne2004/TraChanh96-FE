<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import DarkMode from '@/components/common/DarkMode.vue'
import NotificationDropdown from '@/components/customer/NotificationDropdown.vue'

const route = useRoute()
const userStore = useUserStore()
const isOnline = ref(true) // Có thể bind với navigator.onLine nếu muốn

// Lấy tiêu đề từ router meta
const currentRouteName = computed(() => {
  return route.meta.title || 'Staff Portal'
})

const user = computed(() => userStore.user)
</script>

<template>
  <header class="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center px-6 shrink-0 transition-colors duration-300">
    <h1 class="font-bold text-gray-800 dark:text-gray-100 text-lg">{{ currentRouteName }}</h1>

    <div class="flex items-center space-x-4 md:space-x-5">
      <DarkMode />
      <NotificationDropdown />

      <div class="flex items-center space-x-1" :title="isOnline ? 'Hệ thống Online' : 'Mất kết nối'">
        <span class="relative flex h-3 w-3">
          <span v-if="isOnline" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3" :class="isOnline ? 'bg-green-500' : 'bg-red-500'"></span>
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">{{ isOnline ? 'Online' : 'Offline' }}</span>
      </div>

      <div class="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-300 font-bold text-sm uppercase border border-green-200 dark:border-green-800">
          {{ (user?.staff?.fullName?.charAt(0) || user?.username?.charAt(0)) || 'NV' }}
        </div>
        <div class="flex flex-col hidden sm:flex">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ user?.staff?.fullName || user?.username }}</span>
          <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ user?.staff?.position || user?.role || 'Nhân viên' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
