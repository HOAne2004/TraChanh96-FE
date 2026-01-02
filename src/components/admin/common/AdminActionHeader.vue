<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  // 1. Cấu hình nút Thêm Mới
  showAddButton: {
    type: Boolean,
    default: true, // Mặc định hiển thị nút Thêm mới
  },
  addButtonLabel: {
    type: String,
    default: 'Thêm mới',
  },
  // 2. Cấu hình tìm kiếm
  modelValue: { // Dùng cho v-model (search query)
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm theo tên...',
  },
})

// Định nghĩa emits:
// - update:modelValue: Cho v-model (input)
// - add-new: Khi click nút Thêm mới
const emit = defineEmits(['update:modelValue', 'add-new'])

// Sử dụng biến cục bộ để xử lý debounce/input, sau đó emit giá trị
const localSearchQuery = ref(props.modelValue)

// Đồng bộ hóa input cục bộ với v-model
watch(localSearchQuery, (newValue) => {
  // 💡 Tùy chọn: Thêm debounce ở đây nếu cần tối ưu hiệu suất tìm kiếm
  emit('update:modelValue', newValue)
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow mb-6 flex justify-between items-center flex-wrap gap-4"
  >
    <Button
      v-if="showAddButton"
      @click="emit('add-new')"
      :label="addButtonLabel"
      variant="primary"
      size="md"
    >
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </template>
    </Button>

    <div class="w-full sm:w-64">
      <input
        type="text"
        v-model="localSearchQuery"
        :placeholder="searchPlaceholder"
        class="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
      />
    </div>
  </div>
</template>
