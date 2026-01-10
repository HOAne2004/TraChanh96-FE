<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

// Import các component đã tách
import StaffSidebar from '@/components/staff/common/StaffSidebar.vue'
import StaffHeader from '@/components/staff/common/StaffHeader.vue'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

onMounted(async () => {
  await notificationStore.fetchNotifications()
  await notificationStore.initSignalR()
  
  // 🟢 SỬA LỖI TẠI ĐÂY:
  // Trong user.js hàm tên là fetchUserProfile, không phải fetchUser
  await userStore.fetchUserProfile() 
})

onUnmounted(() => {
  notificationStore.stopSignalR()
})
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <StaffSidebar />

    <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
      <StaffHeader />

      <div class="flex-1 overflow-auto bg-gray-50 p-2 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>