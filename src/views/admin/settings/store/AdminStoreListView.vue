<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import { getStoreStatusOptions } from '@/constants/store.constant'

// Components
import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'

// Icons & Utils
//import { formatDate } from '@/utils/formatters' // Helper format giờ (nếu có)
import { useToastStore } from '@/stores/toast'
import { useModalStore } from '@/stores/modal'
const router = useRouter()
const storeStore = useStoreStore()
const toastStore = useToastStore()
const modalStore = useModalStore()

// --- CONFIG ---
// 1. Cấu hình cột cho bảng
const columns = [
  { key: 'info', label: 'Cửa hàng', minWidth: '250px' },
  { key: 'address', label: 'Địa điểm', minWidth: '200px' },
  { key: 'operatingTime', label: 'Giờ hoạt động', width: '150px' },
  { key: 'status', label: 'Trạng thái', width: '120px', sortable: false },
]

// 2. Option cho Filter
const statusOptions = getStoreStatusOptions()

// --- STATE ---
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  search: '',
  status: '',
})

// --- FETCH DATA ---
async function fetchData() {
  await storeStore.fetchAdminStores({
    search: queryParams.search,
    status: queryParams.status,
    // Nếu API hỗ trợ phân trang thì truyền thêm page/pageSize
    // page: queryParams.page,
    // pageSize: queryParams.pageSize
  })
}

onMounted(() => {
  fetchData()
})

// --- HANDLERS ---

// Xử lý Filter (Search, Status change)
function handleFilterChange(filterValues) {
  queryParams.search = filterValues.keyword
  queryParams.status = filterValues.status
  queryParams.page = 1 // Reset về trang 1 khi filter
  fetchData()
}

// Chuyển trang (Nếu API trả về pagination)
function handlePageChange(page) {
  queryParams.page = page
  fetchData()
}

// Xử lý nút Thêm mới
function handleCreate() {
  router.push({ name: 'admin-store-create' })
}

// Xử lý Actions từ DataTable (Sửa / Xóa)
async function handleAction({ type, item }) {
  if (type === 'view' || type === 'edit') {
    router.push({ name: 'admin-store-edit', params: { id: item.id } })
  }

  if (type === 'delete') {
    // Cách 1: Dùng helper method (khuyến nghị)
    const confirmed = await modalStore.confirmDelete(
      `Bạn có chắc muốn xóa cửa hàng <strong>"${item.name}"</strong>?`
    )

    // Cách 2: Dùng config tùy chỉnh
    // const confirmed = await modalStore.show({
    //   type: 'warning',
    //   title: 'Xác nhận xóa cửa hàng',
    //   message: `Bạn có chắc muốn xóa cửa hàng <strong>"${item.name}"</strong>?`,
    //   confirmButtonText: 'Xóa',
    //   cancelButtonText: 'Hủy'
    // })

    if (confirmed) {
      try {
        await storeStore.deleteStore(item.id)

        toastStore.show({
          type: 'success',
          message: 'Đã xóa cửa hàng thành công'
        })

        fetchData() // Reload lại danh sách
      } catch (error) {
        toastStore.show({
          type: 'error',
          message: 'Xóa thất bại: ' + (error.message || 'Lỗi server')
        })
      }
    }
  }
}

// Helper format hiển thị giờ
function formatOperatingTime(open, close) {
  if (!open || !close) return '--:--'
  // Cắt chuỗi HH:mm:ss -> HH:mm
  const o = open.substring(0, 5)
  const c = close.substring(0, 5)
  return `${o} - ${c}`
}
</script>

<template>
  <div class="p-6">
    <PageHeader
      title="Cửa hàng"
      description="Xem và xử lý các cửa hàng trong hệ thống"
      :filter-options="statusOptions"
      :is-add-button="true"
      @change="handleFilterChange"
      @create="handleCreate"
    />

    <div class="mt-6">
      <AdminDataTable
        :items="storeStore.stores"
        :columns="columns"
        :loading="storeStore.loading"
        :actions="['edit', 'delete']"
        @action="handleAction"
      >
        <template #cell-info="{ item }">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                class="w-full h-full object-cover"
                alt="Store Logo"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-500">{{ item.slug }}</div>
            </div>
          </div>
        </template>

        <template #cell-address="{ item }">
          <div class="max-w-xs truncate text-sm text-gray-600" :title="item.address?.fullAddress">
            {{ item.address?.fullAddress || 'Chưa cập nhật' }}
          </div>
        </template>

        <template #cell-operatingTime="{ item }">
          <span
            class="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"
          >
            {{ formatOperatingTime(item.openTime, item.closeTime) }}
          </span>
        </template>

        <template #cell-status="{ item }">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-medium border"
            :class="{
              'bg-green-100 text-green-800 border-green-200': item.status === 'Active',
              'bg-yellow-100 text-yellow-800 border-yellow-200': item.status === 'ComingSoon',
              'bg-red-100 text-red-800 border-red-200':
                item.status === 'PermanentlyClosed' || item.status === 'TemporarilyClosed',
            }"
          >
            {{ statusOptions.find((o) => o.value === item.status)?.label || item.status }}
          </span>
        </template>
      </AdminDataTable>
    </div>

    <AdminPagination
      v-if="storeStore.pagination"
      :pagination="storeStore.pagination"
      @page-change="handlePageChange"
    />
  </div>
</template>
