<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/marketing/news.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useModalStore } from '@/stores/system/modal.store'

// Components
import PageHeader from '@/components/admin/shared/AdminPageHeader.vue'
import AdminDataTable from '@/components/admin/shared/AdminDataTable.vue'
import AdminPagination from '@/components/admin/shared/AdminPagination.vue'

const router = useRouter()
const newsStore = useNewsStore()
const toastStore = useToastStore()
const modalStore = useModalStore()

// --- CONFIG ---
const columns = [
  { key: 'title', label: 'Bài viết', minWidth: '300px' },
  { key: 'type', label: 'Loại', width: '120px' },
  { key: 'status', label: 'Trạng thái', width: '150px' },
  { key: 'createdAt', label: 'Ngày tạo', width: '150px' },
]

// Mock options cho Trạng thái
const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đã xuất bản', value: 'Published' },
  { label: 'Bản nháp', value: 'Draft' },
  { label: 'Lưu trữ', value: 'Archived' },
]

// --- STATE ---
const queryParams = reactive({
  pageIndex: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

// --- FETCH DATA ---
async function fetchData() {
  await newsStore.fetchAllNewsAdmin({
    pageIndex: queryParams.pageIndex,
    pageSize: queryParams.pageSize,
    keyword: queryParams.keyword,
    status: queryParams.status,
  })
}

onMounted(() => {
  fetchData()
})

// --- HANDLERS ---
function handleFilterChange(filterValues) {
  queryParams.keyword = filterValues.keyword || ''
  queryParams.status = filterValues.status || ''
  queryParams.pageIndex = 1 // Reset page khi search/filter
  fetchData()
}

function handlePageChange(page) {
  queryParams.pageIndex = page
  fetchData()
}

function handleCreate() {
  // router.push({ name: 'admin.news.create' }) // Thay thế tên route nếu có
  toastStore.show({ type: 'info', message: 'Tính năng thêm bài viết đang phát triển' })
}

async function handleAction({ type, item }) {
  if (type === 'edit') {
    // router.push({ name: 'admin.news.edit', params: { id: item.id } })
    toastStore.show({ type: 'info', message: `Sửa bài viết: ${item.title}` })
  }

  if (type === 'delete') {
    const confirmed = await modalStore.confirmDelete(
      `Bạn có chắc muốn xóa bài viết <strong>"${item.title}"</strong>?`
    )
    if (confirmed) {
      try {
        await newsStore.deleteNews(item.id)
        toastStore.show({ type: 'success', message: 'Xóa bài viết thành công' })
        fetchData()
      } catch (error) {
        toastStore.show({
          type: 'error',
          message: 'Lỗi: ' + (error.response?.data?.message || error.message),
        })
      }
    }
  }
}

// Format Date: dd/MM/yyyy
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="p-6">
    <!-- Header & Filter -->
    <PageHeader
      title="Quản lý Tin tức"
      description="Quản lý các bài viết, tin tức và khuyến mãi của cửa hàng"
      :filter-options="statusOptions"
      :is-add-button="true"
      @change="handleFilterChange"
      @create="handleCreate"
    />

    <!-- Data Table -->
    <div class="mt-6">
      <AdminDataTable
        :items="newsStore.newsList"
        :columns="columns"
        :loading="newsStore.loading"
        :actions="['edit', 'delete']"
        @action="handleAction"
      >
        <!-- Custom Cột Bài viết -->
        <template #cell-title="{ item }">
          <div class="flex items-start gap-4 py-2">
            <!-- Thumbnail -->
            <div class="w-16 h-16 shrink-0 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              <img
                v-if="item.imageUrl || item.thumbnail"
                :src="item.imageUrl || item.thumbnail"
                class="w-full h-full object-cover"
                alt="Thumbnail"
              />
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <!-- Info -->
            <div class="flex flex-col">
              <span class="font-semibold text-gray-900 line-clamp-2" :title="item.title">
                {{ item.title }}
              </span>
              <span class="text-xs text-gray-500 mt-1">/{{ item.slug || 'no-slug' }}</span>
            </div>
          </div>
        </template>

        <!-- Custom Cột Loại -->
        <template #cell-type="{ item }">
          <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
            {{ item.type || 'Chưa phân loại' }}
          </span>
        </template>

        <!-- Custom Cột Trạng thái -->
        <template #cell-status="{ item }">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="{
              'bg-green-100 text-green-700': item.status === 'Published',
              'bg-gray-100 text-gray-700': item.status === 'Draft' || !item.status,
              'bg-yellow-100 text-yellow-700': item.status === 'Archived'
            }"
          >
            {{ item.status || 'Draft' }}
          </span>
        </template>

        <!-- Custom Cột Ngày tạo -->
        <template #cell-createdAt="{ item }">
          <span class="text-sm text-gray-600">{{ formatDate(item.createdAt) }}</span>
        </template>
      </AdminDataTable>
    </div>

    <!-- Phân trang -->
    <div class="mt-4" v-if="newsStore.pagination">
      <!-- AdminPagination thường yêu cầu:
        :pagination="{ page: pageIndex, totalPages: Math.ceil(totalCount / pageSize) }"
        Tuỳ theo cấu trúc của AdminPagination bên bạn. Dưới đây là dạng phổ biến nhất.
      -->
      <AdminPagination
        :pagination="{
          page: newsStore.pagination.pageIndex,
          pageSize: newsStore.pagination.pageSize,
          total: newsStore.pagination.totalCount,
          totalPages: Math.ceil(newsStore.pagination.totalCount / newsStore.pagination.pageSize)
        }"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
