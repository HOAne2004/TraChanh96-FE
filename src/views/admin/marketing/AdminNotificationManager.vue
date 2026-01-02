<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal' // Giả sử dùng để show toast

// Enum mapping (Frontend)
const NOTIFICATION_TYPES = [
  { value: 1, label: 'Hệ thống (System)', class: 'bg-gray-100 text-gray-800' },
  { value: 2, label: 'Đơn hàng (Order)', class: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Khuyến mãi (Promotion)', class: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Cá nhân (Personal)', class: 'bg-purple-100 text-purple-800' }
]

const notificationStore = useNotificationStore()
const modalStore = useModalStore()
const { adminNotifications, loading, totalAdminNotis } = storeToRefs(notificationStore)

// Filter State
const filter = reactive({
  pageIndex: 1,
  pageSize: 10,
  keyword: '',
  type: ''
})

// Modal State
const showCreateModal = ref(false)
const isSending = ref(false)
const newNoti = reactive({
  title: '',
  content: '',
  type: 1, // Mặc định là System
  userId: null, // Null = Gửi tất cả
  referenceId: ''
})

// --- METHODS ---
const loadData = () => {
  notificationStore.fetchAdminNotifications(filter)
}

const handleSend = async () => {
  if (!newNoti.title || !newNoti.content) {
    modalStore.showToast('Vui lòng nhập tiêu đề và nội dung', 'warning')
    return
  }

  isSending.value = true
  try {
    // Payload chuẩn DTO Backend
    const payload = {
      ...newNoti,
      // Chuyển userId rỗng thành null để gửi all
      userId: newNoti.userId ? parseInt(newNoti.userId) : null
    }

    await notificationStore.createNotificationAction(payload)
    modalStore.showToast('Gửi thông báo thành công!', 'success')
    showCreateModal.value = false

    // Reset form
    Object.assign(newNoti, { title: '', content: '', type: 1, userId: null, referenceId: '' })

    // Reload list
    loadData()
  } catch (err) {
    modalStore.showToast('Gửi thất bại: ' + err, 'error')
  } finally {
    isSending.value = false
  }
}

const getTypeLabel = (typeVal) => {
  const t = NOTIFICATION_TYPES.find(x => x.value === typeVal)
  return t ? t : { label: 'Khác', class: 'bg-gray-50' }
}

onMounted(() => {
  loadData()
})

watch(() => filter.pageIndex, loadData)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <h1 class="text-xl font-bold text-gray-800 dark:text-white">Quản lý Thông báo</h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tạo thông báo mới
      </button>
    </div>

    <div class="flex gap-4">
      <input
        v-model="filter.keyword"
        @change="loadData"
        placeholder="Tìm theo tiêu đề..."
        class="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 w-64 focus:ring-2 focus:ring-green-500 outline-none"
      />
      <select
        v-model="filter.type"
        @change="loadData"
        class="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
      >
        <option value="">Tất cả loại</option>
        <option v-for="t in NOTIFICATION_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-6 py-4 font-semibold">Tiêu đề</th>
            <th class="px-6 py-4 font-semibold">Loại</th>
            <th class="px-6 py-4 font-semibold">Gửi đến</th>
            <th class="px-6 py-4 font-semibold text-right">Ngày gửi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-if="loading">
             <td colspan="4" class="p-8 text-center text-gray-500">Đang tải...</td>
          </tr>
          <tr v-else-if="adminNotifications.length === 0">
             <td colspan="4" class="p-8 text-center text-gray-500">Không có dữ liệu.</td>
          </tr>
          <tr v-else v-for="item in adminNotifications" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4">
              <p class="font-bold text-gray-800 dark:text-white">{{ item.title }}</p>
              <p class="text-sm text-gray-500 truncate max-w-md">{{ item.content }}</p>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', getTypeLabel(item.type).class]">
                {{ getTypeLabel(item.type).label }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              <span v-if="!item.userId" class="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Tất cả (Broadcast)</span>
              <span v-else>User #{{ item.userId }}</span>
            </td>
            <td class="px-6 py-4 text-right text-sm text-gray-500">
              {{ new Date(item.createdAt).toLocaleString('vi-VN') }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
         <button
           :disabled="filter.pageIndex === 1"
           @click="filter.pageIndex--"
           class="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
         >Trước</button>
         <span class="px-3 py-1">Trang {{ filter.pageIndex }}</span>
         <button
           :disabled="adminNotifications.length < filter.pageSize"
           @click="filter.pageIndex++"
           class="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
         >Sau</button>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 relative z-10 animate-fade-in-up">
        <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gửi thông báo mới</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Loại thông báo</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="t in NOTIFICATION_TYPES" :key="t.value"
                @click="newNoti.type = t.value"
                type="button"
                :class="['px-3 py-1.5 rounded-lg text-sm border transition-all',
                  newNoti.type === t.value ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100']"
              >
                {{ t.label.split('(')[0] }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tiêu đề</label>
            <input v-model="newNoti.title" class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="VD: Bảo trì hệ thống..." />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nội dung</label>
            <textarea v-model="newNoti.content" rows="3" class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nhập nội dung chi tiết..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Người nhận (User ID)</label>
                <input v-model="newNoti.userId" type="number" class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Để trống = Gửi tất cả" />
                <p class="text-xs text-gray-400 mt-1">Để trống để gửi Broadcast.</p>
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mã tham chiếu (Optional)</label>
                <input v-model="newNoti.referenceId" class="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="VD: ORD-123" />
             </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showCreateModal = false" class="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Hủy</button>
          <button
            @click="handleSend"
            :disabled="isSending"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="isSending" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Gửi ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
