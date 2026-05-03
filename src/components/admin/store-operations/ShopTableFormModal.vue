<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) },
  rooms: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'submit'])

const formData = reactive({
  name: '',
  capacity: 4,
  roomId: null
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      Object.assign(formData, {
        name: props.initialData.name || '',
        capacity: props.initialData.capacity || 4,
        roomId: props.initialData.roomId || null
      })
    } else {
      Object.assign(formData, {
        name: '',
        capacity: 4,
        roomId: null
      })
    }
  }
})

const handleSubmit = () => {
  if (!formData.name || !formData.capacity) return
  emit('submit', { ...formData })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 class="text-lg font-bold text-gray-900">
          {{ isEdit ? 'Cập nhật Bàn' : 'Thêm Bàn mới' }}
        </h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên bàn <span class="text-red-500">*</span></label>
          <input 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="VD: Bàn 01"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người) <span class="text-red-500">*</span></label>
          <input 
            v-model="formData.capacity" 
            type="number" 
            min="1"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Khu vực / Phòng</label>
          <select 
            v-model="formData.roomId" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option :value="null">Khác (Không thuộc phòng nào)</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>

        <!-- Footer -->
        <div class="pt-5 flex justify-end gap-3 border-t border-gray-100 mt-6">
          <button 
            type="button" 
            @click="emit('close')"
            class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            class="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            {{ isEdit ? 'Lưu thay đổi' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
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
