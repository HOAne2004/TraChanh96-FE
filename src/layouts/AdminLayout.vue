<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import AdminSidebar from '@/components/admin/common/AdminSidebar.vue';
import AdminHeader from '@/components/admin/common/AdminHeader.vue';

const notificationStore = useNotificationStore();

// --- KẾT NỐI SIGNALR ---
// Khi Admin vào trang quản trị, tự động kết nối để nhận thông báo đơn mới
onMounted(async () => {
  await notificationStore.fetchNotifications(); // Lấy danh sách cũ
  await notificationStore.initSignalR();        // Kết nối realtime
});

// Ngắt kết nối khi rời khỏi layout admin (ví dụ logout ra home)
onUnmounted(() => {
  notificationStore.stopSignalR();
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <AdminSidebar class="hidden lg:block w-72 shrink-0" />

    <div class="flex-1 flex flex-col min-w-0"> <AdminHeader />

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
