<script setup>
import { ref, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const props = defineProps({
  isVisible: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const notificationStore = useNotificationStore()
const { notifications, loading } = storeToRefs(notificationStore)
const router = useRouter()

const currentPage = ref(1)
const pageSize = 5 // Paginate to 5 items per page to fit modal well

const totalPages = computed(() => {
  return Math.ceil(notifications.value.length / pageSize)
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return notifications.value.slice(start, end)
})

const handleClick = async (noti) => {
  if (!noti.isRead) {
    await notificationStore.markAsReadAction(noti.id)
  }
  if (noti.type === 'Order' && noti.referenceId) {
    emit('close')
    if (props.isAdmin) {
      router.push({ path: `/admin/orders/${noti.referenceId}` }) // You might need to adjust this depending on correct admin order route
    } else {
      router.push({ name: 'order-detail', params: { code: noti.referenceId } })
    }
  }
}

const handleDelete = async (noti, event) => {
  event.stopPropagation()
  await notificationStore.deleteNotificationAction(noti.id)
  if (paginatedNotifications.value.length === 0 && currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const getIcon = (type) => {
  switch(type) {
    case 'Order': return '📦'
    case 'Promotion': return '🎁'
    case 'System': return '🔧'
    default: return '🔔'
  }
}
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span>Tất cả thông báo</span>
          <span v-if="notificationStore.unreadCount > 0" class="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
            {{ notificationStore.unreadCount }} mới
          </span>
        </h2>
        <div class="flex items-center gap-3">
          <button @click="notificationStore.markAllAsReadAction" class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
            Đánh dấu đã đọc tất cả
          </button>
          <button @click="emit('close')" class="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1">
        <div v-if="loading" class="text-center py-10">
          <div class="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>

        <div v-else-if="notifications.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="font-medium text-lg">Bạn chưa có thông báo nào</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in paginatedNotifications"
            :key="item.id"
            @click="handleClick(item)"
            class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex gap-4 cursor-pointer hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition relative overflow-hidden group"
            :class="{ 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10': !item.isRead }"
          >
            <div class="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-xl shrink-0">
              {{ getIcon(item.type) }}
            </div>

            <div class="flex-1 pr-8">
              <div class="flex flex-wrap items-center justify-between mb-1">
                <h4 class="font-bold text-gray-800 dark:text-white text-base" :class="{'text-blue-600 dark:text-blue-400': !item.isRead}">
                  {{ item.title }}
                </h4>
                <span class="text-xs font-semibold text-gray-400 dark:text-gray-500">
                  {{ new Date(item.createdAt).toLocaleString('vi-VN') }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                {{ item.content }}
              </p>
            </div>

            <button
              @click="handleDelete(item, $event)"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
              title="Xóa thông báo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div v-if="!item.isRead" class="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg"></div>
          </div>
        </div>
      </div>

      <!-- Footer / Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl shrink-0 flex justify-between items-center">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Trang <span class="font-bold text-gray-900 dark:text-white">{{ currentPage }}</span> / {{ totalPages }}
        </span>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition"
          >
            Trước
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional styling */
</style>
