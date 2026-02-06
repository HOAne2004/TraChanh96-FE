<script setup>
import { onMounted, reactive, watch } from 'vue' // Thêm reactive, watch
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useStoreStore } from '@/stores/store'
import { formatDate, formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'
import {
  getOrderStatusOptions,
  getOrderStatusConfig,
  getOrderTypeConfig,
} from '@/constants/order.constants'

// 🟢 Dùng PageHeader thay vì AdminFilterBar trực tiếp
import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

const router = useRouter()
const orderStore = useOrderStore()
const storeStore = useStoreStore()
const { stores } = storeToRefs(storeStore)
const { orders, pagination, loading } = storeToRefs(orderStore)
const toastStore = useToastStore()

// --- STATE QUẢN LÝ FILTER ---
// 🟢 [MỚI] Gom tất cả filter vào 1 object reactive
const filters = reactive({
  pageIndex: 1,
  pageSize: 10,
  search: '',
  status: '',
  fromDate: '',
  toDate: '',

  // Custom Filter
  storeId: '',
})

// --- ACTIONS ---

const loadData = async () => {
  const params = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,

    // Core
    keyword: filters.search || undefined,
    status: filters.status === '' ? undefined : filters.status,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,

    // Custom
    storeId: filters.storeId === '' ? undefined : filters.storeId,
  }

  try {
    await orderStore.fetchOrders(params)
  } catch (err) {
    console.error('Lỗi tải đơn hàng:', err)
  }
}

// 🟢 Xử lý khi bộ lọc Core thay đổi (Search, Date, Status)
const handleCoreFilterChange = (newFilters) => {
  Object.assign(filters, newFilters)
  filters.pageIndex = 1
  loadData()
}

// 🟢 Xử lý Reset
const handleReset = () => {
  filters.storeId = '' // Reset custom filter
  // Không cần gọi loadData() vì AdminFilterBar đã emit change cho core filter rồi
}

// 🟢 Watch StoreId (Custom Filter)
watch(
  () => filters.storeId,
  () => {
    filters.pageIndex = 1
    loadData()
  },
)

const onPageChange = (newPage) => {
  filters.pageIndex = newPage
  loadData()
}

// ... (Các hàm helper handleDeleteOrder, goToDetail, exportToExcel GIỮ NGUYÊN) ...
const handleDeleteOrder = async (id) => {
  /* Code cũ... */
}
const goToDetail = (code) => {
  router.push({ name: 'admin.orders.detail', params: { code } })
}

// Hàm xuất Excel giữ nguyên logic cũ, chỉ map lại gọi từ template
const exportToExcel = () => {
  // ... Copy y nguyên logic cũ của bạn ...
  if (!orders.value || orders.value.length === 0) {
    toastStore.show({ message: 'Không có dữ liệu', type: 'error' })
    return
  }
  // ... (Code tạo CSV giữ nguyên) ...
  toastStore.show({ type: 'success', message: 'Đang tải xuống...' })
}

// --- CONFIG ---
const orderColumns = [
  { key: 'orderCode', label: 'Mã đơn', cellClass: 'font-medium select-text' },
  { key: 'customer', label: 'Khách hàng', cellClass: 'select-text' },
  { key: 'createdAt', label: 'Ngày đặt' },
  { key: 'orderType', label: 'Loại', headerClass: 'text-center', cellClass: 'text-center' },
  {
    key: 'grandTotal',
    label: 'Tổng tiền',
    headerClass: 'text-right',
    cellClass: 'text-right font-bold',
  },
  { key: 'status', label: 'Trạng thái', headerClass: 'text-center', cellClass: 'text-center' },
]

// --- LIFECYCLE ---
onMounted(async () => {
  await Promise.all([loadData(), storeStore.fetchActiveStores()])
})
</script>

<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <PageHeader
      title="Đơn hàng"
      description="Xem và xử lý các đơn hàng trong hệ thống"
      :filter-options="getOrderStatusOptions()"
      :is-add-button="false"
      @change="handleCoreFilterChange"
      @reset="handleReset"
      @export="exportToExcel"
    >
      <template #filter-ext>
        <div v-if="stores && stores.length > 0">
          <label class="block text-xs font-medium text-gray-500 mb-1">Cửa hàng</label>
          <div class="relative">
            <select
              v-model="filters.storeId"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">Tất cả cửa hàng</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>

            <button
              v-if="filters.storeId !== ''"
              @click="filters.storeId = ''"
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
      </template>
    </PageHeader>

    <AdminDataTable
      :items="orders"
      :columns="orderColumns"
      :loading="loading"
      :total-count="pagination.totalRecords"
      @change-page="onPageChange"
    >
      <template #cell-customer="{ item }">
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-white">
            {{ item.recipientName || item.userName || 'Khách lẻ' }}
          </span>
          <span class="text-xs text-gray-500 select-all">{{ item.recipientPhone }}</span>
        </div>
      </template>

      <template #cell-createdAt="{ value }">
        <span class="text-gray-500 text-sm">{{ formatDate(value) }}</span>
      </template>

      <template #cell-orderType="{ item }">
        <span
          :class="['px-2 py-0.5 rounded text-xs border', getOrderTypeConfig(item.orderType).color]"
        >
          {{ getOrderTypeConfig(item.orderType).label }}
        </span>
      </template>

      <template #cell-grandTotal="{ value }"> {{ formatPrice(value) }} đ </template>

      <template #cell-status="{ value }">
        <span
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            getOrderStatusConfig(value).color,
          ]"
        >
          {{ getOrderStatusConfig(value).label }}
        </span>
      </template>

      <template #action="{ item }">
        <div class="flex items-center justify-center gap-2">
          <button
            @click="goToDetail(item.orderCode || item.id)"
            class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <button
            @click="handleDeleteOrder(item.id)"
            class="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </template>
    </AdminDataTable>

    <AdminPagination :pagination="pagination" @page-change="onPageChange" />
  </div>
</template>
