<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const { notifications, loading } = storeToRefs(notificationStore)
const router = useRouter()

onMounted(() => {
  notificationStore.fetchNotifications()
})

const handleClick = async (noti) => {
  if (!noti.isRead) {
    await notificationStore.markAsReadAction(noti.id)
  }
  if (noti.type === 'Order' && noti.referenceId) {
     router.push({ name: 'order-detail', params: { code: noti.referenceId } })
  }
}

// Icon helper
const getIcon = (type) => {
    switch(type) {
        case 'Order': return '📦';
        case 'Promotion': return '🎁';
        case 'System': return '🔧';
        default: return '🔔';
    }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Tất cả thông báo</h1>
      <button @click="notificationStore.markAllAsReadAction" class="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
        Đánh dấu tất cả đã đọc
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">
        <div class="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
        <p>Bạn không có thông báo nào.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in notifications"
        :key="item.id"
        @click="handleClick(item)"
        class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
        :class="{ 'border-l-4 border-l-blue-500': !item.isRead }"
      >
        <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl shrink-0">
            {{ getIcon(item.type) }}
        </div>

        <div class="flex-1">
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-gray-800 dark:text-white text-base" :class="{'text-blue-600': !item.isRead}">
                    {{ item.title }}
                </h4>
                <span class="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {{ new Date(item.createdAt).toLocaleString('vi-VN') }}
                </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {{ item.content }}
            </p>
        </div>

        <div v-if="!item.isRead" class="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg"></div>
      </div>
    </div>
  </div>
</template>
