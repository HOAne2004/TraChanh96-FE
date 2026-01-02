<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/formatters' // Giả sử có hàm format

const props = defineProps({
  isAdmin: { type: Boolean, default: false }
})

const notificationStore = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(notificationStore)
const router = useRouter()

const isOpen = ref(false)

// Lấy 5 tin mới nhất để hiện popup
const recentNotifications = computed(() => {
  return notifications.value.slice(0, 5)
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleNotificationClick = async (noti) => {
  // 1. Đánh dấu đã đọc
  if (!noti.isRead) {
    await notificationStore.markAsReadAction(noti.id)
  }

 // 2. Điều hướng
  if (noti.type === 'Order' && noti.referenceId) {
     if (props.isAdmin) {
        // 🔴 Nếu là Admin -> Sang trang chi tiết đơn Admin (Giả sử route name là 'admin-order-detail')
        // Bạn cần đảm bảo đã định nghĩa route này trong router/admin.js
        router.push({ path: `/admin/orders/${noti.referenceId}` }) // Hoặc query theo ID nếu BE trả về ID
     } else {
        // 🔵 Nếu là Customer -> Sang trang chi tiết đơn Customer
        router.push({ name: 'order-detail', params: { code: noti.referenceId } })
     }
  }

  isOpen.value = false
}

const viewAll = () => {
  router.push('/notifications')
  isOpen.value = false
}

// Click outside to close (Cơ bản)
const closeDropdown = () => {
  // Có thể dùng v-click-outside nếu có thư viện, hoặc xử lý đơn giản ở đây
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button @click="toggleDropdown" class="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
      <div class="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 class="font-bold text-gray-800 dark:text-white">Thông báo</h3>
        <button @click="notificationStore.markAllAsReadAction" class="text-xs text-blue-500 hover:underline">Đọc tất cả</button>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="recentNotifications.length === 0" class="p-4 text-center text-gray-500 text-sm">
          Chưa có thông báo nào.
        </div>

        <div v-else>
          <div
            v-for="item in recentNotifications"
            :key="item.id"
            @click="handleNotificationClick(item)"
            class="p-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors relative"
            :class="{ 'bg-blue-50/50': !item.isRead }"
          >
            <div v-if="!item.isRead" class="absolute top-4 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>

            <p class="text-sm font-semibold text-gray-800 dark:text-white mb-0.5 pr-4">{{ item.title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ item.content }}</p>
            <p class="text-[10px] text-gray-400 mt-1 text-right">{{ new Date(item.createdAt).toLocaleString('vi-VN') }}</p>
          </div>
        </div>
      </div>

      <div class="p-2 bg-gray-50 dark:bg-gray-700/50 text-center">
        <button @click="viewAll" class="text-xs font-bold text-green-600 hover:text-green-700">
          Xem tất cả
        </button>
      </div>
    </div>

    <div v-if="isOpen" @click="closeDropdown" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
