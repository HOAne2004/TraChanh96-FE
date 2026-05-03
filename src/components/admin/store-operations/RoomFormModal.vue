<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'submit'])

const formData = reactive({
  name: '',
  capacity: 0,
  description: '',
  isAirConditioned: false,
  isSmokingAllowed: false
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      Object.assign(formData, {
        name: props.initialData.name || '',
        capacity: props.initialData.capacity || 0,
        description: props.initialData.description || '',
        isAirConditioned: props.initialData.isAirConditioned || false,
        isSmokingAllowed: props.initialData.isSmokingAllowed || false
      })
    } else {
      Object.assign(formData, {
        name: '',
        capacity: 0,
        description: '',
        isAirConditioned: false,
        isSmokingAllowed: false
      })
    }
  }
})

const handleSubmit = () => {
  if (!formData.name) return
  emit('submit', { ...formData })
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 class="text-lg font-bold text-gray-900">
          {{ isEdit ? 'Cập nhật Khu vực/Phòng' : 'Thêm Khu vực/Phòng mới' }}
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên khu vực <span class="text-red-500">*</span></label>
          <input 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="VD: Tầng 1, Sân vườn..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
          <input 
            v-model="formData.capacity" 
            type="number" 
            min="0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea 
            v-model="formData.description" 
            rows="3"
            placeholder="Mô tả khu vực này..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
        </div>

        <div class="flex gap-6 pt-2">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input v-model="formData.isAirConditioned" type="checkbox" class="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer">
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Có máy lạnh</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer group">
            <input v-model="formData.isSmokingAllowed" type="checkbox" class="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer">
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Cho phép hút thuốc</span>
          </label>
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
