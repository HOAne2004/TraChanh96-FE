<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatters'

const props = defineProps({
  user: { type: Object, required: true },
})

const emit = defineEmits(['refresh']) // Báo cho cha load lại data sau khi lưu

const userStore = useUserStore()
const toast = useToastStore()
const isEditing = ref(false)

const editForm = ref({})

const startEdit = () => {
  editForm.value = {
    username: props.user.username,
    phone: props.user.phone,
  }
  isEditing.value = true
}

const handleSave = async () => {
  try {
    await userStore.updateUser(props.user.publicId, editForm.value)
    toast.show({ type: 'success', message: 'Cập nhật hồ sơ thành công' })
    isEditing.value = false
    emit('refresh') // Gọi cha reload lại data mới nhất
  } catch (err) {
    toast.show({ type: 'error', message: 'Cập nhật thất bại' })
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <h3 class="font-bold text-gray-800">Thông tin hồ sơ</h3>
      <button
        v-if="!isEditing"
        @click="startEdit"
        class="text-blue-600 text-sm font-medium hover:underline"
      >
        Chỉnh sửa
      </button>
      <div v-else class="flex gap-2">
        <button @click="isEditing = false" class="text-gray-500 text-sm hover:text-gray-700">
          Hủy
        </button>
        <button @click="handleSave" class="text-green-600 text-sm font-bold hover:text-green-700">
          Lưu
        </button>
      </div>
    </div>

    <div class="flex items-start gap-6">
      <div
        class="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0"
      >
        <img
          :src="user.thumbnailUrl || `https://ui-avatars.com/api/?name=${user.username}&size=128`"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase">Họ và tên</label>
          <input
            v-if="isEditing"
            v-model="editForm.username"
            class="mt-1 w-full border-b border-blue-300 focus:border-blue-600 outline-none py-1"
          />
          <p v-else class="mt-1 font-medium text-gray-900">{{ user.username }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase">Số điện thoại</label>
          <input
            v-if="isEditing"
            v-model="editForm.phone"
            class="mt-1 w-full border-b border-blue-300 focus:border-blue-600 outline-none py-1"
          />
          <p v-else class="mt-1 font-medium text-gray-900">{{ user.phone || 'Chưa cập nhật' }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase">Email</label>
          <p class="mt-1 font-medium text-gray-900">{{ user.email }}</p>
          <span v-if="user.emailVerified" class="text-xs text-green-600 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Đã xác thực
          </span>
          <span v-else class="text-xs text-yellow-600">Chưa xác thực</span>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase">Ngày tham gia</label>
          <p class="mt-1 text-sm text-gray-700">{{ formatDate(user.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
