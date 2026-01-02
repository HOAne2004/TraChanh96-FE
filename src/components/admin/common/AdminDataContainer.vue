<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Dữ liệu chính (ví dụ: categories.value)
  items: {
    type: Array,
    default: () => [],
  },
  // Trạng thái tải (ví dụ: categoryStore.isLoading)
  loading: {
    type: Boolean,
    default: false,
  },
  // Tiêu đề tìm kiếm (searchQuery)
  searchQuery: {
    type: String,
    default: '',
  },
  // Tiêu đề của loại dữ liệu (ví dụ: 'danh mục', 'sản phẩm')
  dataType: {
    type: String,
    default: 'kết quả',
  },
})

// 👉 Tính toán trạng thái không có kết quả
const showNoResults = computed(() => {
  return !props.loading && props.items.length === 0
})

// 👉 Tính toán xem có nên hiển thị thông báo "Không tìm thấy"
const showSearchMessage = computed(() => {
  // Chỉ hiển thị thông báo tìm kiếm nếu có nội dung tìm kiếm
  return showNoResults.value && props.searchQuery.length > 0
})

// 👉 Tính toán xem có nên hiển thị thông báo "Dữ liệu rỗng ban đầu"
const showInitialEmpty = computed(() => {
  // Chỉ hiển thị thông báo rỗng ban đầu nếu không có kết quả VÀ không có từ khóa tìm kiếm
  return showNoResults.value && props.searchQuery.length === 0
})
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-10 text-gray-500 dark:text-gray-400">
      <p>Đang tải dữ liệu {{ dataType }}...</p>
    </div>

    <div
      v-else-if="showSearchMessage"
      class="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow"
    >
      <div class="max-w-xs mx-auto mb-4">
        <img
          src="@assets/images/empty-states/empty-search.png"
          alt="Không tìm thấy sản phẩm phù hợp"
          title="Không tìm thấy sản phẩm phù hợp"
          class="opacity-70 w-full h-auto dark:opacity-100"
        />
      </div>
      <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
        Không tìm thấy {{ dataType }} nào phù hợp!
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Vui lòng thử lại với từ khóa tìm kiếm khác: "{{ searchQuery }}".
      </p>
    </div>

    <div
      v-else-if="showInitialEmpty"
      class="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow"
    >
      <div class="max-w-xs mx-auto mb-4">
        <img
          src="@assets/images/others/error-404.png"
          :alt="`Chưa có ${dataType} nào được tạo`"
          :title="`Chưa có ${dataType} nào được tạo`"
          class="opacity-70 w-full h-auto dark:opacity-100"
        />
      </div>
      <slot name="empty-state">
        <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Chưa có {{ dataType }} nào được tạo.
        </p>
        <p class="text-sm text-gray-500 mt-2">Hãy sử dụng nút "Thêm mới" để bắt đầu.</p>
      </slot>
    </div>

    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>
