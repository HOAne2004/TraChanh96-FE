<script setup>
import { watch, ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useCategoryStore } from '@/stores/category'
import { useModalStore } from '@/stores/modal'
import { checkCategoryUsage } from '@/services/category.service'

import { formatDate } from '@/utils/formatters'

import AdminDataTable from '@/components/admin/ui/AdminDataTable.vue'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal.vue'
import AdminActionHeader from '@/components/admin/ui/AdminActionHeader.vue'
import AdminDataContainer from '@/components/admin/ui/AdminDataContainer.vue'

const categoryStore = useCategoryStore()
const modalStore = useModalStore()

const { categories, isLoading } = storeToRefs(categoryStore)

const searchQuery = ref('')
const isModalOpen = ref(false)
const editingCategory = ref(null)

// 🟢 1. XỬ LÝ HIỂN THỊ TÊN DANH MỤC CHA
// Chúng ta tạo một computed để map parentId -> parentName
const processedCategories = computed(() => {
  if (!categories.value) return []

  // Tạo Map để tra cứu nhanh ID -> Name
  const categoryMap = new Map(categories.value.map((c) => [c.id, c.name]))

  return categories.value.map((cat) => ({
    ...cat,
    // Nếu có parentId, tìm tên trong Map. Nếu không thấy hoặc null thì hiển thị 'Gốc'
    parentName: cat.parentId ? categoryMap.get(cat.parentId) : '(Danh mục gốc)',
  }))
})

// Cấu hình cột
const categoryColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Tên danh mục', sortable: true },
  { key: 'slug', label: 'Slug' },
  { key: 'parentName', label: 'Danh mục cha' },
  { key: 'createdAt', label: 'Ngày tạo' },
]

// Debounce tìm kiếm
let debounceTimer = null
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      await categoryStore.fetchCategories({ q: newQuery })
    } catch (err) {
      console.error('Lỗi tìm kiếm danh mục:', err)
    }
  }, 300)
})

onMounted(async () => {
  try {
    await categoryStore.fetchCategories({})
  } catch (err) {
    console.error('Lỗi tải danh mục:', err)
  }
})

// Mở modal tạo mới
const handleCreateNew = () => {
  editingCategory.value = null
  isModalOpen.value = true
}

const handleEdit = (category) => {
  editingCategory.value = category
  isModalOpen.value = true
}

const handleDelete = async (category) => {
  const count = await checkCategoryUsage(category.id)
  let message = `Bạn có muốn xóa danh mục "${category.name}"?`
  if (count > 0) {
    message += `\n\n🔥 CẢNH BÁO QUAN TRỌNG 🔥\nDanh mục này đang chứa ${count} sản phẩm.\nNếu bạn xóa danh mục, TOÀN BỘ ${count} SẢN PHẨM NÀY SẼ BỊ XÓA VĨNH VIỄN!`
    message += `\n\nBạn có thực sự chắc chắn không?`
  }
  if (confirm(message)) {
    try {
      await categoryStore.deleteCategoryAction(category.id)
      modalStore.showToast(`Đã xóa thành công ${category.name}!`, 'success')
    } catch (error) {
      modalStore.showToast(error.message, 'error')
    }
  }
}
</script>

<template>
  <main class="p-6">
    <h1 class="text-3xl font-bold mb-6">Quản lý Danh mục Sản phẩm</h1>

    <AdminActionHeader
      v-model="searchQuery"
      addButtonLabel="Thêm Danh mục mới"
      @add-new="handleCreateNew"
    />

    <AdminDataContainer
      :items="categories"
      :loading="isLoading"
      :search-query="searchQuery"
      data-type="danh mục"
    >
      <template #empty-state>
        <div class="flex flex-col items-center justify-center p-6">
          <p class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Chưa có danh mục nào được tạo.
          </p>
          <button
            @click="handleCreateNew"
            class="text-green-600 hover:text-green-800 font-medium underline cursor-pointer transition-colors"
          >
            Bấm vào đây để tạo danh mục đầu tiên
          </button>
        </div>
      </template>
      <AdminDataTable
        :items="processedCategories"
        :columns="categoryColumns"
        :loading="isLoading"
        :actions="['edit', 'delete']"
        @edit-row="handleEdit"
        @delete-row="handleDelete"
      >
        <template #cell-createdAt="{ value }">
          {{ formatDate(value) }}
        </template>

        <template #cell-parentName="{ value }">
          <span
            :class="
              value === '(Danh mục gốc)' ? 'text-gray-400 italic' : 'text-green-600 font-medium'
            "
          >
            {{ value }}
          </span>
        </template>
      </AdminDataTable>
    </AdminDataContainer>
  </main>

  <CategoryFormModal
    v-if="isModalOpen"
    :category="editingCategory"
    :is-open="isModalOpen"
    @close="isModalOpen = false"
  />
</template>
