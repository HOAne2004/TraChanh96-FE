<script setup>
import { defineProps, defineEmits } from 'vue'
import StatusBadge from './StatusBadge.vue' // Giả định component này đã được tạo

// Khai báo các sự kiện (events) mà component này sẽ phát ra
const emit = defineEmits(['edit-row', 'delete-row', 'toggle-status', 'change-page', 'sort-column'])

// Khai báo Props
const props = defineProps({
  // Dữ liệu chính để hiển thị (ví dụ: products, users, categories)
  items: {
    type: Array,
    required: true,
  },
  // Cấu hình các cột hiển thị: [{ key: 'name', label: 'Tên', isBadge: false }]
  columns: {
    type: Array,
    required: true,
  },
  // Trạng thái tải dữ liệu
  loading: {
    type: Boolean,
    default: false,
  },
  // Cấu hình các nút hành động (ví dụ: ['edit', 'delete'])
  actions: {
    type: Array,
    default: () => ['edit', 'delete'],
  },
  // Tùy chọn, tổng số bản ghi (cho phân trang nếu cần)
  totalCount: {
    type: Number,
    default: 0,
  },
  // Tùy chọn, thông tin trang hiện tại và giới hạn
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 10 }),
  },
})

// 👉 Tính toán giá trị của một trường dữ liệu (hỗ trợ nested object)
const getCellValue = (item, key) => {
  // Ví dụ: item.category.name => ['category', 'name']
  return key.split('.').reduce((o, i) => (o ? o[i] : null), item)
}

// 👉 Xử lý khi nhấn nút hành động
const handleAction = (action, item) => {
  if (action === 'edit') {
    emit('edit-row', item)
  } else if (action === 'delete') {
    emit('delete-row', item)
  } else if (action === 'toggle-status') {
    emit('toggle-status', item)
  }
}

// 👉 Tạo một chuỗi ID duy nhất cho khóa
const getUniqueKey = (item, index) => {
  return item.id ? item.id : item.slug ? item.slug : index
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
    <table v-if="loading" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="i in 5" :key="i">
          <td v-for="j in columns.length" :key="j" class="px-6 py-4 whitespace-nowrap">
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          </td>
        </tr>
      </tbody>
    </table>

    <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-green-500"
            @click="col.sortable ? emit('sort-column', col.key) : null"
          >
            {{ col.label }}
          </th>
          <th
            v-if="actions.length"
            class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right"
          >
            Hành động
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="(item, index) in items" :key="getUniqueKey(item, index)">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
          >
            <slot :name="`cell-${col.key}`" :item="item" :value="getCellValue(item, col.key)">
              <StatusBadge v-if="col.isBadge" :status="getCellValue(item, col.key)" />

              <img
                v-else-if="
                  col.key.toLowerCase().includes('imageurl') ||
                  col.key.toLowerCase().includes('logourl')
                "
                :src="getCellValue(item, col.key)"
                alt="Ảnh"
                class="w-10 h-10 object-cover rounded-md"
              />

              <span v-else>{{ getCellValue(item, col.key) }}</span>
            </slot>
          </td>

          <td
            v-if="actions.length"
            class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
          >
            <button
              v-for="action in actions"
              :key="action"
              type="button"
              @click="handleAction(action, item)"
              :class="[
                'ml-3 inline-flex items-center text-xs font-medium rounded-full p-2',
                action === 'edit'
                  ? 'text-blue-600 hover:text-blue-900 bg-blue-100'
                  : action === 'delete'
                    ? 'text-red-600 hover:text-red-900 bg-red-100'
                    : 'text-gray-600 hover:text-gray-900 bg-gray-100',
              ]"
            >
              <svg
                v-if="action === 'edit'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
                />
                <path
                  d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
                />
              </svg>
              <svg
                v-else-if="action === 'delete'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                  clip-rule="evenodd"
                />
              </svg>

              <span v-else class="text-sm">{{ action }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="totalCount > 0"
      class="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700"
    >
      <div class="text-sm text-gray-700 dark:text-gray-400">
        Hiển thị {{ items.length }} trên {{ totalCount }} kết quả
      </div>

      <div class="flex space-x-2">
        <button
          @click="emit('change-page', pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="px-3 py-1 text-sm rounded-lg border dark:border-gray-600 dark:text-white"
        >
          Trước
        </button>
        <span class="px-3 py-1 text-sm font-semibold dark:text-white">
          Trang {{ pagination.page }}
        </span>
        <button
          @click="emit('change-page', pagination.page + 1)"
          :disabled="pagination.page * pagination.limit >= totalCount"
          class="px-3 py-1 text-sm rounded-lg border dark:border-gray-600 dark:text-white"
        >
          Sau
        </button>
      </div>
    </div>
  </div>
</template>
