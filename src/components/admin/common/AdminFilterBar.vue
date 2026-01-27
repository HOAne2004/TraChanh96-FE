<script setup>
import { reactive, watch, computed } from 'vue'
import debounce from 'lodash/debounce'

const props = defineProps({
  placeholder: { type: String, default: 'Tìm kiếm...' },
  statusOptions: { type: Array, default: () => [] },
  storeOptions: { type: Array, default: () => [] },
  isFindStore:{type:Boolean,default:false}
})

const emit = defineEmits(['change', 'export'])

const filters = reactive({
  search: '',
  status: '',
  storeId: '',
  fromDate: '',
  toDate: '',
})

// Giới hạn ngày
const maxFromDate = computed(() => {
  return filters.toDate || undefined
})

const minToDate = computed(() => {
  return filters.fromDate || undefined
})

// Debounce Search
const onSearchInput = debounce(() => {
  emitChange()
}, 500)

const emitChange = () => {
  const cleanFilters = {
    keyword: filters.search ? filters.search.trim() : undefined,
    status: filters.status === '' ? undefined : filters.status,
    storeId: filters.storeId === '' ? undefined : filters.storeId,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  }
  emit('change', cleanFilters)
}

// Watch changes
watch(
  () => [filters.status, filters.storeId, filters.fromDate, filters.toDate],
  () => {
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      filters.toDate = ''
    }
    emitChange()
  },
  { deep: true },
)

const clearField = (field) => {
  filters[field] = ''
  emitChange()
}

const onReset = () => {
  filters.search = ''
  filters.status = ''
  filters.storeId = ''
  filters.fromDate = ''
  filters.toDate = ''
  emitChange()
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
  >
    <div class="flex flex-col md:flex-row gap-4 justify-between items-end">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        <div class="lg:col-span-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm</label>
          <div class="relative group">
            <input
              v-model="filters.search"
              @input="onSearchInput"
              type="text"
              :placeholder="placeholder"
              class="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              v-if="filters.search"
              @click="clearField('search')"
              class="absolute right-2 top-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              title="Xóa tìm kiếm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="isFindStore">
          <label class="block text-xs font-medium text-gray-500 mb-1">Cửa hàng</label>
          <div class="relative">
            <select
              v-model="filters.storeId"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">Tất cả cửa hàng</option>
              <option v-for="store in storeOptions" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
            <button
              v-if="filters.storeId !== ''"
              @click="clearField('storeId')"
              class="absolute right-8 top-2.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300"
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
          <div class="relative">
            <select
              v-model="filters.status"
              class="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">Tất cả</option>
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <button
              v-if="filters.status !== ''"
              @click="clearField('status')"
              class="absolute right-6 top-2.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700"
              title="Xóa chọn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="relative">
          <label class="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
          <div class="relative">
            <input
              v-model="filters.fromDate"
              type="date"
              :max="maxFromDate"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              v-if="filters.fromDate"
              @click="clearField('fromDate')"
              class="absolute right-8 top-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 px-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4"
              >
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="flex-1 relative">
            <label class="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
            <div class="relative">
              <input
                v-model="filters.toDate"
                type="date"
                :min="minToDate"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                v-if="filters.toDate"
                @click="clearField('toDate')"
                class="absolute right-8 top-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700 px-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-end">
            <button
              @click="onReset"
              class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              title="Reset toàn bộ"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        @click="$emit('export')"
        class="shrink-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 flex items-center gap-2 shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Excel
      </button>
    </div>
  </div>
</template>
