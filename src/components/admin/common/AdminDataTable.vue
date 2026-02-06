<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import EmptySearch from '@/assets/images/empty-states/empty-search.png'
// Thêm event 'sort' để báo ra ngoài khi ở chế độ Server
const emit = defineEmits(['change-page', 'action', 'sort'])

const props = defineProps({
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  totalCount: { type: Number, default: 0 },
  pagination: { type: Object, default: () => ({ pageIndex: 1, pageSize: 10 }) },
  actions: { type: Array, default: () => [] },

  // 🛠️ MỚI: Bật chế độ Server Side (Mặc định false -> Tự sort)
  serverSide: { type: Boolean, default: false },
})

const isEmpty = computed(() => {
  return !props.loading && displayItems.value.length === 0
})

// State sort
const sortKey = ref('')
const sortOrder = ref('desc') // 'asc' hoặc 'desc'

// --- HÀM HELPER ---
const getCellValue = (item, key) => {
  return key.split('.').reduce((o, i) => (o ? o[i] : null), item)
}

// --- HÀM XỬ LÝ CLICK HEADER ---
const handleSort = (key) => {
  // 1. Cập nhật state UI (Đổi chiều mũi tên)
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc' // Mặc định cột mới là tăng dần
  }

  // 2. Kiểm tra chế độ
  if (props.serverSide) {
    // 📡 Server Mode: Emit ra ngoài để gọi API
    emit('sort', { key: sortKey.value, order: sortOrder.value })
  } else {
    // 💻 Local Mode: Không làm gì cả, computed 'displayItems' sẽ tự chạy lại
  }
}

// --- LOGIC HIỂN THỊ DỮ LIỆU ---
const displayItems = computed(() => {
  // TRƯỜNG HỢP 1: Server Side -> Hiển thị nguyên gốc (API đã sort rồi)
  if (props.serverSide) return props.items

  // TRƯỜNG HỢP 2: Local -> Tự sort mảng items
  let data = [...props.items]
  if (!sortKey.value) return data

  data.sort((a, b) => {
    let valueA = getCellValue(a, sortKey.value)
    let valueB = getCellValue(b, sortKey.value)

    if (valueA == null) return 1
    if (valueB == null) return -1

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * (sortOrder.value === 'asc' ? 1 : -1)
    }

    valueA = valueA.toString().toLowerCase()
    valueB = valueB.toString().toLowerCase()

    if (sortOrder.value === 'asc') return valueA.localeCompare(valueB)
    return valueB.localeCompare(valueA)
  })
  return data
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700"
  >
    <div v-if="loading" class="p-12 flex justify-center">
      <svg
        class="animate-spin h-8 w-8 text-green-500"
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
    </div>

    <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors select-none"
            :class="[
              col.headerClass,
              col.sortable !== false
                ? 'cursor-pointer hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                : '',
            ]"
            @click="col.sortable !== false ? handleSort(col.key) : null"
          >
            <div class="flex items-center gap-1">
              {{ col.label }}

              <span v-if="col.sortable !== false" class="text-gray-400">
                <svg
                  v-if="sortKey !== col.key"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <svg
                  v-else-if="sortOrder === 'asc'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
              </span>
            </div>
          </th>

          <th
            v-if="actions.length > 0 || $slots.action"
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Thao tác
          </th>
        </tr>
      </thead>

      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-if="isEmpty"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <td
            :colspan="columns.length + 1"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <img :src="EmptySearch" alt="Empty" class="w-48 opacity-80" />
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                Không có dữ liệu
              </p>
            </div>
          </td>
        </tr>
        <tr
          v-for="(item, index) in displayItems"
          :key="item.id || index"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
            :class="col.cellClass"
          >
            <slot :name="`cell-${col.key}`" :item="item" :value="getCellValue(item, col.key)">
              {{ getCellValue(item, col.key) }}
            </slot>
          </td>

          <td
            v-if="actions.length > 0 || $slots.action"
            class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
          >
            <div class="flex items-center justify-center gap-2">
              <button
                v-if="actions.includes('view')"
                @click="$emit('action', { type: 'view', item })"
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button
                v-if="actions.includes('edit')"
                @click="$emit('action', { type: 'edit', item })"
                class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                v-if="actions.includes('delete')"
                @click="$emit('action', { type: 'delete', item })"
                class="p-1.5 text-red-600 hover:bg-red-50 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <slot name="action" :item="item"></slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
