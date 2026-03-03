<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/category'
import { useToastStore } from '@/stores/toast'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'
import {
  PUBLIC_STATUS_UI,
  getPublicStatusOptions,
  mapLabelToValue,
} from '@/constants/status.constants'
// --- SETUP STORES ---
const categoryStore = useCategoryStore()
const toastStore = useToastStore()
const { categories, flatCategories, loading } = storeToRefs(categoryStore)

// --- STATE QUẢN LÝ ---
const isModalOpen = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)

// Form Model
const formData = reactive({
  id: null,
  name: '',
  parentId: null,
  sortOrder: 0,
  status: 'Active', // Mặc định Active
})

// Cấu hình bảng
const categoryColumns = [
  { key: 'name', label: 'Tên danh mục', cellClass: 'font-medium text-gray-900', sortable: true },
  { key: 'slug', label: 'Slug (Đường dẫn)', cellClass: 'text-gray-500 text-sm' },
  { key: 'sortOrder', label: 'Thứ tự', cellClass: 'text-center', headerClass: 'text-center' },
  { key: 'status', label: 'Trạng thái', cellClass: 'text-center', headerClass: 'text-center' },
]

// --- ACTIONS ---

// 1. Load dữ liệu
const fetchData = async () => {
  await categoryStore.fetchCategories()
}

// 2. Mở Modal Thêm mới
const openCreateModal = () => {
  isEditMode.value = false
  // Reset form
  formData.id = null
  formData.name = ''
  formData.parentId = null
  formData.sortOrder = 0
  formData.status = 'Active'

  isModalOpen.value = true
}

// 3. Mở Modal Sửa
const openEditModal = (item) => {
  isEditMode.value = true
  // Fill data
  formData.id = item.id
  formData.name = item.name
  formData.parentId = item.parentId || null
  formData.sortOrder = item.sortOrder || 0
  formData.status = item.status

  isModalOpen.value = true
}

// 4. Submit Form (Create/Update)
const handleSubmit = async () => {
  if (!formData.name)
    return toastStore.showToast({
      title: 'Lỗi',
      message: 'Tên danh mục không được để trống',
      type: 'error',
    })

  submitting.value = true
  try {
    const payload = {
      name: formData.name,
      parentId: formData.parentId,
      sortOrder: formData.sortOrder,
      status: formData.status === 'Active',
    }

    if (isEditMode.value) {
      await categoryStore.updateCategoryAction(formData.id, payload)
      toastStore.showToast({
        title: 'Thành công',
        message: 'Cập nhật danh mục thành công',
        type: 'success',
      })
    } else {
      await categoryStore.createCategoryAction(payload)
      toastStore.showToast({
        title: 'Thành công',
        message: 'Tạo danh mục mới thành công',
        type: 'success',
      })
    }

    isModalOpen.value = false
    // Không cần fetch lại vì action trong store đã fetch rồi
  } catch (err) {
    // Error đã được handle trong store hoặc hiển thị ở đây
  } finally {
    submitting.value = false
  }
}

// 5. Xóa danh mục
const handleDelete = async (item) => {
  try {
    await categoryStore.deleteCategoryAction(item.id)
    toastStore.showToast({ title: 'Thành công', message: 'Đã xóa danh mục', type: 'success' })
  } catch (err) {
    // Error handle
  }
}

// Lọc danh sách cha để tránh chọn chính mình làm cha (Circular dependency)
const parentOptions = computed(() => {
  if (!isEditMode.value) return flatCategories.value
  // Nếu đang sửa, loại bỏ chính nó khỏi danh sách cha
  return flatCategories.value.filter((c) => c.id !== formData.id)
})

const onTableAction = ({ type, item }) => {
  if (type === 'edit') {
    openEditModal(item)
  } else if (type === 'delete') {
    handleDelete(item)
  }
}

//6.
// Lấy danh sách option (Trừ Deleted)
const statusOptions = getPublicStatusOptions()

// Xử lý thay đổi nhanh trạng thái
const handleQuickStatusUpdate = async (item, event) => {
  const newValue = event.target.value
  const oldLabel = item.status

  // Gọi API cập nhật
  try {
    const payload = {
      name: item.name,
      parentId: item.parentId,
      sortOrder: item.sortOrder,
      status: newValue,
    }

    await categoryStore.updateCategoryAction(item.id, payload)

    toastStore.showToast({
      title: 'Thành công',
      message: 'Cập nhật trạng thái thành công',
      type: 'success',
    })
  } catch (err) {
    event.target.value = mapLabelToValue(oldLabel)
    console.error(err)
  }
}

// Helper để xác định màu sắc dựa trên Label hiện tại
const getStatusColor = (label) => {
  const val = mapLabelToValue(label)
  return PUBLIC_STATUS_UI[val]?.color || 'text-gray-600 bg-gray-50 border-gray-200'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Danh mục sản phẩm</h1>
        <p class="text-sm text-gray-500 mt-1">Quản lý phân loại menu</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
          />
        </svg>
        Thêm mới
      </button>
    </div>

    <AdminDataTable
      :items="flatCategories"
      :columns="categoryColumns"
      :loading="loading"
      :pagination="null"
      :actions="['edit', 'delete']"
      @action="onTableAction"
    >
      <template #cell-name="{ item }">
        <span :class="item.parentId ? 'text-gray-600 ml-4' : 'font-bold'">
          {{ item.displayName || item.name }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <div class="relative">
          <select
            :value="mapLabelToValue(item.status)"
            @change="handleQuickStatusUpdate(item, $event)"
            @click.stop
            :class="[
              'appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-all',
              getStatusColor(item.status),
            ]"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <div
            class="pointer-events-none absolute inset-y-0 right-12 flex items-center px-2 text-current opacity-60"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </template>
    </AdminDataTable>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div
          class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Cập nhật danh mục' : 'Thêm danh mục mới' }}
          </h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Tên danh mục <span class="text-red-500">*</span></label
            >
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Ví dụ: Trà sữa"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Danh mục cha</label
            >
            <select
              v-model="formData.parentId"
              class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option :value="null">-- Không có (Danh mục gốc) --</option>
              <option v-for="cat in parentOptions" :key="cat.id" :value="cat.id">
                {{ cat.displayName }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Thứ tự</label
              >
              <input
                v-model="formData.sortOrder"
                type="number"
                class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Trạng thái</label
              >
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Ẩn</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <svg
                v-if="submitting"
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
