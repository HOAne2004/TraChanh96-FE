<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
  <header class="h-14 bg-white border-b border-gray-200 flex justify-between items-center px-6 shrink-0">
    <h1 class="font-bold text-gray-800 text-lg">{{ currentRouteName }}</h1>

    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-1" :title="isOnline ? 'Hệ thống Online' : 'Mất kết nối'">
        <span class="relative flex h-3 w-3">
          <span v-if="isOnline" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3" :class="isOnline ? 'bg-green-500' : 'bg-red-500'"></span>
        </span>
        <span class="text-xs text-gray-500">{{ isOnline ? 'Online' : 'Offline' }}</span>
      </div>

      <div class="h-6 w-px bg-gray-300 mx-2"></div>

      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
          {{ user?.username?.charAt(0) || 'NV' }}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-700">{{ user?.username }}</span>
          <span class="text-[10px] text-gray-500">{{ user?.role || 'Nhân viên' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>