<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Bộ lọc sản phẩm',
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'update:selected'])

const selectedCategories = ref([...props.modelValue])

// Sync with v-model if it changes externally
watch(
  () => props.modelValue,
  (newVal) => {
    selectedCategories.value = [...newVal]
  },
)

const toggleCategory = (id) => {
  id = String(id)
  if (selectedCategories.value.includes(id)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== id)
  } else {
    selectedCategories.value.push(id)
  }
  emitUpdate()
}

const clearAll = () => {
  selectedCategories.value = []
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', selectedCategories.value)
  emit('update:selected', selectedCategories.value) // Keep for backward compatibility if needed
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md"
  >
    <!-- Header -->
    <div
      class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50"
    >
      <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
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
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>

        {{ title }}
      </h3>

      <button
        v-if="selectedCategories.length > 0"
        @click="clearAll"
        class="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Xóa tất cả
      </button>
    </div>

    <!-- Content -->
    <div class="p-5">
      <div v-if="categories.length === 0" class="text-center text-red-500 text-sm py-4">
        Hiện tại chưa có danh mục sản phẩm
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="toggleCategory(cat.id)"
          class="group relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border"
          :class="[
            selectedCategories.includes(String(cat.id))
              ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200 dark:shadow-none transform scale-105'
              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400',
          ]"
        >
          <span class="relative z-10 flex items-center gap-1.5">
            {{ cat.name }}
            <span
              v-if="selectedCategories.includes(String(cat.id))"
              class="bg-white/20 rounded-full p-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </span>
        </button>
      </div>

      <!-- Footer Info -->
      <div
        class="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center text-xs text-gray-400"
      >
        <span>{{ categories.length }} danh mục</span>
        <span v-if="selectedCategories.length > 0" class="text-green-600 font-medium">
          Đã chọn {{ selectedCategories.length }}
        </span>
      </div>
    </div>
  </div>
</template>
