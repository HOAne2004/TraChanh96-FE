<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

import AdminSidebar from '@/components/admin/common/AdminSidebar.vue'
import AdminHeader from '@/components/admin/common/AdminHeader.vue'

const notificationStore = useNotificationStore()

const isSidebarOpen = ref(false)

// SignalR lifecycle
onMounted(async () => {
  await notificationStore.fetchNotifications()
  await notificationStore.initSignalR()
})

onUnmounted(() => {
  notificationStore.stopSignalR()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar -->
    <AdminSidebar
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <!-- Overlay mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
    />

    <!-- Content -->
    <div class="lg:ml-72 flex flex-col min-h-screen">
      <!-- Header -->
      <AdminHeader @toggle-sidebar="isSidebarOpen = true" />

      <!-- Main -->
      <main class="flex-1 p-4 md:p-6 overflow-y-auto">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
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
