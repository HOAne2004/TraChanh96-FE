<script setup>
import AdminFilterBar from '@/components/admin/common/AdminFilterBar.vue'
const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  filterOptions: { type: Array, default: () => [] },
  isAddButton: { type: Boolean, default: true },
  isFindStore: { type: Boolean, default: false },
  isFilterRating: { type: Boolean, default: false }
})

const emit = defineEmits(['create', 'change'])

const handleCreate = () => {
  emit('create')
}

const handleFilterChange = (newFilters) => {
  emit('change', newFilters)
}
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white"> Quản lý {{ title }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
      </div>

      <button
        v-if="isAddButton"
        @click="handleCreate"
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Thêm {{ title }}
      </button>
    </div>

    <AdminFilterBar
      :placeholder="`Tìm theo tên ${title}...`"
      :status-options="filterOptions"
      :is-find-store="isFindStore"
      :is-filter-rating="isFilterRating"
      @change="handleFilterChange"
    />
  </div>
</template>
