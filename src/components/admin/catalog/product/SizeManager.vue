<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import sizeService from '@/services/size.service' // Gọi trực tiếp service cho gọn
import { formatPrice } from '@/utils/formatters'

const sizes = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const toast = useToastStore()

// Form State
const isEditMode = ref(false)
const formData = ref({
  id: null,
  label: '',      // Tên hiển thị: "Vừa", "Lớn"
  name: '',       // Tên nội bộ (nếu cần): "M", "L"
  priceModifier: 0
})

// --- ACTIONS ---

const fetchSizes = async () => {
  isLoading.value = true
  try {
    // Giả sử API trả về { data: [...] }
    const res = await sizeService.getAll()
    sizes.value = res.data || []
    // Sort theo giá tăng dần để hiển thị đẹp (S -> M -> L)
    sizes.value.sort((a, b) => a.priceModifier - b.priceModifier)
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const openModal = (size = null) => {
  if (size) {
    isEditMode.value = true
    formData.value = { ...size }
  } else {
    isEditMode.value = false
    formData.value = { id: null, label: '', name: '', priceModifier: 0 }
  }
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!formData.value.label) return toast.show({ type: 'warning', message: 'Chưa nhập tên size' })

  try {
    if (isEditMode.value) {
      await sizeService.update(formData.value.id, formData.value)
      toast.show({ type: 'success', message: 'Cập nhật thành công' })
    } else {
      await sizeService.create(formData.value)
      toast.show({ type: 'success', message: 'Thêm size thành công' })
    }
    isModalOpen.value = false
    fetchSizes()
  } catch (err) {
    toast.show({ type: 'error', message: 'Lỗi lưu dữ liệu' })
  }
}

const handleDelete = async (id) => {
  if (!confirm('Xóa kích thước này? (Sẽ ảnh hưởng các món đang dùng)')) return
  try {
    await sizeService.delete(id)
    fetchSizes()
    toast.show({ type: 'success', message: 'Đã xóa' })
  } catch (err) {
    toast.show({ type: 'error', message: 'Không thể xóa (đang được sử dụng)' })
  }
}

onMounted(fetchSizes)
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
    <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h3 class="font-bold text-gray-800">Kích thước (Sizes)</h3>
        <p class="text-xs text-gray-500">Cấu hình các loại size mặc định</p>
      </div>
      <button
        @click="openModal()"
        class="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
        title="Thêm mới"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="isLoading" class="text-center py-4 text-xs text-gray-400">Đang tải...</div>

      <div v-else class="space-y-2">
        <div
          v-for="s in sizes"
          :key="s.id"
          class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group"
        >
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {{ s.label.charAt(0) }}
             </div>
             <div>
                <div class="font-medium text-sm text-gray-800">{{ s.label }}</div>
                <div class="text-xs text-gray-500">+{{ formatPrice(s.priceModifier) }}</div>
             </div>
          </div>

          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(s)" class="text-blue-500 hover:text-blue-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button @click="handleDelete(s.id)" class="text-red-500 hover:text-red-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
       <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
          <h3 class="text-lg font-bold mb-4">{{ isEditMode ? 'Sửa kích thước' : 'Thêm kích thước mới' }}</h3>

          <div class="space-y-4">
             <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Tên hiển thị</label>
                <input v-model="formData.label" type="text" placeholder="Ví dụ: Vừa, Lớn..." class="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none" />
             </div>
             <div>
                <label class="text-xs font-bold text-gray-500 uppercase">Giá mặc định (+)</label>
                <input v-model="formData.priceModifier" type="number" class="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none" />
             </div>
          </div>

          <div class="flex gap-3 mt-6 justify-end">
             <button @click="isModalOpen = false" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold">Hủy</button>
             <button @click="handleSave" class="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 text-sm font-bold">Lưu</button>
          </div>
       </div>
    </div>
  </div>
</template>
