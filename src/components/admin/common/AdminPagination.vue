<script setup>
defineProps({
  pagination: {
    type: Object,
    required: true,
    default: () => ({ pageIndex: 1, totalPages: 1, totalRecords: 0 })
  }
})
const emit = defineEmits(['page-change'])
</script>

<template>
  <div v-if="pagination.totalRecords > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-b-xl">
    <span class="text-xs text-gray-500">
      Hiển thị <strong>{{ pagination.pageIndex }}</strong> / <strong>{{ pagination.totalPages }}</strong> trang (Tổng {{ pagination.totalRecords }} kết quả)
    </span>
    <div class="flex gap-2">
      <button
        @click="$emit('page-change', pagination.pageIndex - 1)"
        :disabled="pagination.pageIndex <= 1"
        class="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
      >
        Trước
      </button>
      <button
        @click="$emit('page-change', pagination.pageIndex + 1)"
        :disabled="pagination.pageIndex >= pagination.totalPages"
        class="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
      >
        Sau
      </button>
    </div>
  </div>
</template>
