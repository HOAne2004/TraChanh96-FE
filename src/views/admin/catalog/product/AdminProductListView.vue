<script setup>
import { onMounted, reactive, watch } from 'vue' // Thêm watch
import { useRouter } from 'vue-router'
import defaultDrinkImage from '@/assets/images/others/default-drink.png'

// Import Constants
import {
  getProductStatusOptions,
  getProductStatusConfig,
  getProductTypeOptions,   // 🟢 Import mới
  getProductTypeConfig     // 🟢 Import mới (để tô màu cột Type nếu cần)
} from '@/constants/product.constants'

import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

import { useProductStore } from '@/stores/product'
import { useModalStore } from '@/stores/modal'
import { formatPrice } from '@/utils/formatters'

const router = useRouter()
const productStore = useProductStore()
const modalStore = useModalStore()

// State quản lý Filters
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  search: '',
  status: '',
  type: '',      // 🟢 Custom Filter
  fromDate: '',
  toDate: '',
})

// Options
const filterStatusOptions = getProductStatusOptions(true) // Ẩn "Deleted"
const filterTypeOptions = getProductTypeOptions()         // 🟢 Lấy option Loại

// Fetch Data
async function fetchData() {
  await productStore.fetchProducts({
    pageIndex: queryParams.page,
    pageSize: queryParams.pageSize,

    // Core params
    keyword: queryParams.search || undefined,
    status: queryParams.status === '' ? undefined : queryParams.status,
    fromDate: queryParams.fromDate || undefined,
    toDate: queryParams.toDate || undefined,

    // Custom params
    type: queryParams.type === '' ? undefined : queryParams.type,
  })
}

// --- HANDLERS ---

// 1. Xử lý khi Core Filters thay đổi (Search, Status, Date) - Từ PageHeader emit ra
function handleCoreFilterChange(values) {
  queryParams.search = values.keyword
  queryParams.status = values.status
  queryParams.fromDate = values.fromDate
  queryParams.toDate = values.toDate

  queryParams.page = 1
  fetchData()
}

// 2. Xử lý khi Reset - Từ PageHeader emit ra
function handleReset() {
  queryParams.type = '' // Reset custom filter
  // Không cần gọi fetchData() vì handleCoreFilterChange sẽ chạy ngay sau đó
}

// 3. Xử lý phân trang
function handlePageChange(page) {
  queryParams.page = page
  fetchData()
}

// 4. Watch Custom Filter (Type) để tự động reload
watch(() => queryParams.type, () => {
  queryParams.page = 1
  fetchData()
})

function handleCreate() {
  router.push({ name: 'admin.products.create' })
}

// --- TABLE CONFIG ---
const columns = [
  { key: 'name', label: 'Tên sản phẩm', sortable: true },
  { key: 'productType', label: 'Loại', sortable: true }, // 🟢 Thêm cột Loại
  { key: 'basePrice', label: 'Giá', sortable: true },
  { key: 'totalSold', label: 'Đã bán', sortable: true },
  { key: 'status', label: 'Trạng thái', sortable: true },
]

async function handleAction({ type, item }) {
  if (type === 'edit' || type === 'view') {
    router.push({ name: 'admin.products.edit', params: { id: item.id } })
    return
  }
  if (type === 'delete') {
    const confirmed = await modalStore.confirmDelete()
    if (confirmed) {
      await productStore.deleteProduct(item.id)
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <PageHeader
      title="Sản phẩm"
      description="Xem, tạo, cập nhật sản phẩm"
      :filter-options="filterStatusOptions"
      @create="handleCreate"
      @change="handleCoreFilterChange"
      @reset="handleReset"
    >
      <template #filter-ext>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Loại sản phẩm</label>
          <div class="relative">
            <select
              v-model="queryParams.type"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">Tất cả loại</option>
              <option v-for="opt in filterTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <button
              v-if="queryParams.type !== ''"
              @click="queryParams.type = ''"
              class="absolute right-8 top-2.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                 <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
               <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>
      </template>
    </PageHeader>

    <AdminDataTable
      :items="productStore.products"
      :columns="columns"
      :loading="productStore.loading"
      :actions="['edit', 'delete']"
      @action="handleAction"
    >
      <template #cell-name="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
            <img
               :src="item.imageUrl || defaultDrinkImage"
               class="w-full h-full object-contain"
               alt="Product"
            />
          </div>
          <div>
            <div class="font-medium text-gray-900">{{ item.name }}</div>
            <div class="text-xs text-gray-500">{{ item.slug }}</div>
          </div>
        </div>
      </template>

      <template #cell-productType="{ item }">
         <span :class="`px-2 py-0.5 rounded text-[11px] border ${getProductTypeConfig(item.productType).color}`">
            {{ getProductTypeConfig(item.productType).label }}
         </span>
      </template>

      <template #cell-basePrice="{ item }">
        {{ formatPrice(item.basePrice) }} đ
      </template>

      <template #cell-status="{ item }">
        <span :class="`px-2.5 py-1 rounded-full text-xs font-bold border ${getProductStatusConfig(item.status).color}`">
          {{ getProductStatusConfig(item.status).label }}
        </span>
      </template>
    </AdminDataTable>

    <AdminPagination
      v-if="productStore.pagination"
      :pagination="productStore.pagination"
      @page-change="handlePageChange"
    />
  </div>
</template>
