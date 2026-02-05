<script setup>
import { ref, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useReviewStore } from '@/stores/review'
import { formatDate } from '@/utils/formatters'
import { getReviewStatusConfig, getReviewStatusOptions } from '@/constants/review.constants'

// Import Shared Components
import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminReviewModal from '@/components/admin/marketing/AdminReviewModal.vue'

// Init Store
const reviewStore = useReviewStore()
const { adminReviews, adminTotalItems, loading } = storeToRefs(reviewStore)

// --- CONFIG ---
const columns = [
  { key: 'productInfo', label: 'Sản phẩm', sortable: false },
  { key: 'userInfo', label: 'Khách hàng' },
  { key: 'rating', label: 'Đánh giá', sortable: true },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdAt', label: 'Ngày tạo' },
]

const filterOptions = getReviewStatusOptions()

// --- STATE ---
// 🟢 [SỬA 1] Khai báo đầy đủ các trường để đảm bảo Vue theo dõi đúng
const filters = reactive({
  pageIndex: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  storeId: '',
  rating: '',
  hasReply: '',
  fromDate: '',
  toDate: '',
})

const showModal = ref(false)
const selectedReview = ref(null)

// --- ACTIONS ---

const fetchData = async () => {
  // Map filter từ component sang params API
  const params = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,

    // 🟢 [SỬA FIX] Dùng endpoint admin-search nên đổi lại thành Keyword (thường DTO backend đặt là Keyword hoặc SearchTerm)
    // Nếu backend DTO là ReviewFilterDto { public string Keyword { get; set; } } thì phải gửi key là keyword
    keyword: filters.keyword || undefined,
    status: filters.status === '' ? undefined : filters.status,
    storeId: filters.storeId || undefined,

    rating: filters.rating === '' ? undefined : Number(filters.rating),
    hasReply: filters.hasReply === '' ? undefined : filters.hasReply,

    // Gửi định dạng YYYY-MM-DD nguyên bản từ input type="date"
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  }

  // Debug để xem params gửi đi có đúng không
  //console.log('Fetching with params:', params)

  await reviewStore.fetchAdminReviews(params)
}

// Xử lý sự kiện từ PageHeader (FilterBar)
const handleFilterChange = (newFilters) => {
  filters.keyword = newFilters.keyword ?? ''
  filters.status = newFilters.status ?? ''
  filters.storeId = newFilters.storeId ?? ''
  filters.rating = newFilters.rating ?? ''
  filters.hasReply = newFilters.hasReply ?? ''
  filters.fromDate = newFilters.fromDate ?? ''
  filters.toDate = newFilters.toDate ?? ''

  filters.pageIndex = 1
  fetchData()
}

// Xử lý phân trang
const handlePageChange = (page) => {
  filters.pageIndex = page
  fetchData()
}

// Xử lý Action
const handleAction = ({ type, item }) => {
  if (type === 'edit' || type === 'view') {
    selectedReview.value = item
    showModal.value = true
  }
}

const onModalSuccess = () => {
  fetchData() // Reload lại dữ liệu sau khi update
}

// Init
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <PageHeader
      title="Đánh giá & Bình luận"
      description="Quản lý phản hồi từ khách hàng"
      :filter-options="filterOptions"
      :is-add-button="false"
      :is-filter-rating="true"
      @change="handleFilterChange"
    />

    <AdminDataTable
      :items="adminReviews"
      :columns="columns"
      :loading="loading"
      :actions="['edit']"
      :total-count="adminTotalItems"
      @action="handleAction"
    >
      <template #cell-productInfo="{ item }">
        <div class="flex items-center gap-3">
          <img
            :src="item.productImage || '/default-drink.png'"
            class="w-10 h-10 rounded object-cover border"
          />
          <div>
            <p class="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">
              {{ item.productName }}
            </p>
            <p class="text-xs text-gray-500">{{ item.productSlug }}</p>
          </div>
        </div>
      </template>

      <template #cell-userInfo="{ item }">
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.userName }}</p>
          <span
            class="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400"
          >
            Đơn: #{{ item.orderCode }}
          </span>
        </div>
      </template>

      <template #cell-rating="{ item }">
        <div class="max-w-xs">
          <div class="flex text-yellow-400 text-xs mb-1">
            <span v-for="n in 5" :key="n">{{ n <= item.rating ? '★' : '☆' }}</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">
            "{{ item.content }}"
          </p>
          <span
            v-if="item.adminResponse"
            class="inline-block mt-1 text-[10px] text-green-600 font-bold border border-green-200 bg-green-50 px-1.5 rounded"
          >
            Đã trả lời
          </span>
        </div>
      </template>

      <template #cell-status="{ value }">
        <span
          :class="`px-2 py-1 rounded-full text-xs font-bold ${getReviewStatusConfig(value).color}`"
        >
          {{ getReviewStatusConfig(value).label }}
        </span>
      </template>

      <template #cell-createdAt="{ value }">
        {{ formatDate(value) }}
      </template>
    </AdminDataTable>

    <AdminPagination
      :pagination="{
        pageIndex: filters.pageIndex,
        totalPages: Math.ceil(adminTotalItems / filters.pageSize),
        totalRecords: adminTotalItems,
      }"
      @page-change="handlePageChange"
    />

    <AdminReviewModal
      :is-open="showModal"
      :review="selectedReview"
      @close="showModal = false"
      @success="onModalSuccess"
    />
  </div>
</template>
