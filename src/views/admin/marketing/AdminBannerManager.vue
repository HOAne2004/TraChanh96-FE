<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useBannerStore } from '@/stores/marketing/banner.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useModalStore } from '@/stores/system/modal.store'

import AdminPageHeader from '@/components/admin/shared/AdminPageHeader.vue'
import AdminDataTable  from '@/components/admin/shared/AdminDataTable.vue'
import AppButton       from '@/components/ui/AppButton.vue'
import uploadService   from '@/services/system/upload.service'

const bannerStore = useBannerStore()
const toastStore  = useToastStore()
const modalStore  = useModalStore()

// --- STATE ---
const isModalOpen = ref(false)
const isEditing   = ref(false)
const currentId   = ref(null)
const isUploading = ref(false)

const form = reactive({
  imageUrl: '',
  title: '',
  linkUrl: '',
  sortOrder: 0,
  position: 'Home-Top',
  status: 2 // Active
})

const columns = [
  { key: 'imageUrl',  label: 'Hình ảnh',  sortable: false },
  { key: 'title',     label: 'Tiêu đề',   sortable: true },
  { key: 'position',  label: 'Vị trí',    sortable: true },
  { key: 'sortOrder', label: 'Thứ tự',    sortable: true, cellClass: 'text-center', headerClass: 'text-center' },
]

const positionOptions = [
  { value: 'Home-Top',    label: 'Đầu trang chủ' },
  { value: 'Home-Middle', label: 'Giữa trang chủ' },
  { value: 'Sidebar',     label: 'Thanh bên' },
  { value: 'Popup',       label: 'Thông báo nổi' }
]

// --- ACTIONS ---
const fetchData = () => bannerStore.fetchBanners()

onMounted(fetchData)

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadService.uploadFile(formData)
    
    // Fallback based on typical API responses
    form.imageUrl = res.data?.url || res.data || ''
    toastStore.show({ type: 'success', message: 'Tải ảnh lên thành công' })
  } catch (err) {
    console.error('Lỗi upload ảnh:', err)
    toastStore.show({ type: 'error', message: 'Tải ảnh thất bại. Vui lòng thử lại' })
  } finally {
    isUploading.value = false
    event.target.value = '' // Reset input
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentId.value = null
  Object.assign(form, {
    imageUrl: '',
    title: '',
    linkUrl: '',
    sortOrder: 0,
    position: 'Home-Top',
    status: 2
  })
  isModalOpen.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  currentId.value = item.id
  Object.assign(form, {
    imageUrl: item.imageUrl,
    title: item.title,
    linkUrl: item.linkUrl,
    sortOrder: item.sortOrder,
    position: item.position || 'Home-Top',
    status: 2
  })
  isModalOpen.value = true
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await bannerStore.updateBanner(currentId.value, { ...form, id: currentId.value })
      toastStore.show({ type: 'success', message: 'Cập nhật banner thành công' })
    } else {
      await bannerStore.createBanner(form)
      toastStore.show({ type: 'success', message: 'Thêm banner mới thành công' })
    }
    isModalOpen.value = false
    fetchData()
  } catch (err) {
    toastStore.show({ type: 'error', message: 'Có lỗi xảy ra, vui lòng thử lại' })
  }
}

const handleDelete = async (item) => {
  const confirmed = await modalStore.confirmDelete(`Xóa banner "${item.title || 'không tên'}"?`)
  if (confirmed) {
    try {
      await bannerStore.deleteBanner(item.id)
      toastStore.show({ type: 'success', message: 'Đã xóa banner' })
      fetchData()
    } catch (err) {
      toastStore.show({ type: 'error', message: 'Lỗi khi xóa banner' })
    }
  }
}

const handleAction = ({ type, item }) => {
  if (type === 'edit' || type === 'row-click') openEditModal(item)
  if (type === 'delete') handleDelete(item)
}
</script>

<template>
  <div class="p-6">
    <AdminPageHeader
      title="Quản lý Banner"
      description="Quản lý các banner quảng cáo và khuyến mãi trên hệ thống"
      @create="openCreateModal"
    />

    <AdminDataTable
      :items="bannerStore.banners"
      :columns="columns"
      :loading="bannerStore.loading"
      :actions="['delete']"
      @action="handleAction"
    >
      <!-- Action slot: Edit -->
      <template #action="{ item }">
        <button
          @click="openEditModal(item)"
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          title="Chỉnh sửa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </template>

      <!-- Cell: Image -->
      <template #cell-imageUrl="{ value }">
        <div class="w-40 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img :src="value" class="w-full h-full object-cover" alt="Banner" />
        </div>
      </template>

      <!-- Cell: Title -->
      <template #cell-title="{ item }">
        <div class="flex flex-col">
          <span class="font-bold text-gray-800">{{ item.title || '(Chưa có tiêu đề)' }}</span>
          <span class="text-xs text-blue-500 truncate max-w-[200px]">{{ item.linkUrl }}</span>
        </div>
      </template>

      <!-- Cell: Position -->
      <template #cell-position="{ value }">
        <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
          {{ positionOptions.find(o => o.value === value)?.label || value }}
        </span>
      </template>
    </AdminDataTable>

    <!-- Modal: Create/Edit -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? 'Cập nhật Banner' : 'Thêm Banner mới' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form Content -->
        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="mb-4 space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Link ảnh</label>
                <input
                  v-model="form.imageUrl"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white px-2 text-gray-500">Hoặc tải lên</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                  :disabled="isUploading"
                />
                <svg v-if="isUploading" class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div v-if="form.imageUrl" class="mt-2 w-full h-32 rounded-lg border border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                 <img :src="form.imageUrl" class="h-full object-contain" alt="Preview" />
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (Tùy chọn)</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <!-- Link URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Link khi nhấn (Tùy chọn)</label>
              <input
                v-model="form.linkUrl"
                type="text"
                placeholder="/products/tra-sua"
                class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Position -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vị trí hiển thị</label>
                <select
                  v-model="form.position"
                  class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                <input
                  v-model.number="form.sortOrder"
                  type="number"
                  class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <AppButton
                variant="secondary"
                label="Hủy"
                type="button"
                @click="isModalOpen = false"
              />
              <AppButton
                type="submit"
                variant="primary"
                :label="isEditing ? 'Cập nhật' : 'Tạo mới'"
                :loading="bannerStore.loading"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
