<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/category'
import CategorySelectInput from './CategorySelectInput.vue' // Input chọn ParentId

const props = defineProps({
  category: {
    type: Object, // Dữ liệu danh mục hiện tại (nếu đang chỉnh sửa)
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])
const categoryStore = useCategoryStore()

const formData = reactive({
  name: '',
  slug: '',
  parentId: null, // ID của danh mục cha
})

// Dùng cho tiêu đề modal
const isEditMode = computed(() => !!props.category)
const modalTitle = computed(() => (isEditMode.value ? 'Chỉnh sửa Danh mục' : 'Tạo Danh mục mới'))

// Khởi tạo form data khi props.category thay đổi
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formData.name = newCategory.name
      formData.slug = newCategory.slug
      formData.parentId = newCategory.parentId // Có thể là null
    } else {
      // Reset form cho chế độ tạo mới
      formData.name = ''
      formData.slug = ''
      formData.parentId = null
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  // Giả định: Validation đã được xử lý (hoặc dùng thư viện VeeValidate/Zod)

  const payload = {
    name: formData.name,
    slug: formData.slug || null, // Gửi null nếu trống để backend tự tạo
    parentId: formData.parentId,
  }

  try {
    if (isEditMode.value) {
      // Cập nhật
      await categoryStore.updateCategoryAction(props.category.id, payload)
    } else {
      // Tạo mới
      await categoryStore.createCategoryAction(payload)
    }
    emit('close')
  } catch (error) {
    // Lỗi sẽ được hiển thị qua Toast trong store
    console.error('Lỗi khi submit form category:', error)
  }
}

// Tải dữ liệu cây cho Select Input khi modal mở
onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
  >
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">{{ modalTitle }}</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium">Tên Danh mục</label>
          <input
            type="text"
            id="name"
            v-model.trim="formData.name"
            required
            class="w-full mt-1 p-2 border rounded-md"
          />
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium">Slug (Tùy chọn)</label>
          <input
            type="text"
            id="slug"
            v-model.trim="formData.slug"
            placeholder="Để trống sẽ tự tạo"
            class="w-full mt-1 p-2 border rounded-md"
          />
        </div>

        <CategorySelectInput
          v-model:selected-id="formData.parentId"
          :category-tree="categoryStore.categoryTree"
          label="Danh mục cha (ParentId)"
          :placeholder="`Chọn nếu ${modalTitle} là danh mục con`"
        />

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            {{ isEditMode ? 'Lưu Thay đổi' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
