<script setup>
import { onMounted, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Components
import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

// Stores
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { useMembershipLevelStore } from '@/stores/membershipLevel' // 🟢 Import Store Hạng thành viên

// Utils & Constants
import { formatDate } from '@/utils/formatters'
import { getUserStatusOptions, getUserStatusConfig, USER_ROLE } from '@/constants/user.constants'

const router = useRouter()
const userStore = useUserStore()
const membershipStore = useMembershipLevelStore() // 🟢
const modalStore = useModalStore()

const { users, loading, pagination } = storeToRefs(userStore)
const { levels: membershipLevels } = storeToRefs(membershipStore) // 🟢 Lấy levels từ store

// --- STATE FILTER ---
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  search: '',
  status: '',
  membershipLevelId: '', // Filter theo hạng
})

// Options
const statusOptions = getUserStatusOptions(true) // Ẩn deleted

// --- FETCH DATA ---
async function fetchData() {
  await userStore.fetchUsers({
    pageIndex: queryParams.page,
    pageSize: queryParams.pageSize,
    keyword: queryParams.search || undefined,
    status: queryParams.status === '' ? undefined : queryParams.status,
    roleId: USER_ROLE.CUSTOMER,
    membershipLevelId: queryParams.membershipLevelId || undefined,
  })
}

// --- HANDLERS ---
function handleCoreFilterChange(values) {
  queryParams.search = values.keyword
  queryParams.status = values.status
  queryParams.page = 1
  fetchData()
}

function handleReset() {
  queryParams.membershipLevelId = ''
  // PageHeader sẽ emit change để fetch lại
}

function handlePageChange(page) {
  queryParams.page = page
  fetchData()
}

// Vì khách hàng thường tự đăng ký, nút Create ở đây có thể dẫn đến form tạo nhanh (nếu cần)
function handleCreate() {
  router.push({ name: 'admin.customer.create' })
}

async function handleAction({ type, item }) {
  if (type === 'edit') {
    // Dùng PublicId để bảo mật và đúng chuẩn BE
    router.push({ name: 'admin.customer.detail', params: { id: item.publicId } })
  }
  if (type === 'delete') {
    // Logic xóa user (nếu cần)
  }
}

// Watch Membership Filter
watch(
  () => queryParams.membershipLevelId,
  () => {
    queryParams.page = 1
    fetchData()
  },
)

// --- INIT ---
onMounted(async () => {
  // 1. Gọi API lấy danh sách User
  fetchData()

  // 2. 🟢 Gọi API lấy danh sách Hạng thành viên (để fill vào dropdown)
  // Kiểm tra nếu chưa có data thì mới gọi để đỡ tốn resource
  if (membershipLevels.value.length === 0) {
    await membershipStore.fetchLevels()
  }
})

// --- TABLE CONFIG (KHAI BÁO CỨNG - KHÔNG CẦN PUSH) ---
const columns = [
  { key: 'info', label: 'Khách hàng', class: 'min-w-[250px]' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'membership', label: 'Hạng thành viên' }, // Cột riêng cho Customer
  { key: 'status', label: 'Trạng thái', class: 'text-center' },
  { key: 'createdAt', label: 'Ngày tham gia', class: 'text-right' },
]
</script>

<template>
  <div class="p-6">
    <PageHeader
      title="Khách hàng"
      description="Quản lý thông tin và hạng thành viên của khách hàng"
      :filter-options="statusOptions"
      :show-create="false"
      @create="handleCreate"
      @change="handleCoreFilterChange"
      @reset="handleReset"
    >
      <template #filter-ext>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Hạng thành viên</label>
          <div class="relative">
            <select
              v-model="queryParams.membershipLevelId"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-green-500 appearance-none min-w-[150px]"
            >
              <option value="">Tất cả hạng</option>
              <option v-for="level in membershipLevels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>

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
      :items="users"
      :columns="columns"
      :loading="loading"
      :actions="['edit']"
      @action="handleAction"
    >
      <template #cell-info="{ item }">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0"
          >
            <img
              :src="
                item.thumbnailUrl ||
                `https://ui-avatars.com/api/?name=${item.username}&background=random`
              "
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <div class="font-medium text-gray-900">{{ item.username || 'Chưa cập nhật tên' }}</div>
            <div class="text-xs text-gray-500">{{ item.email || 'Email trống' }}</div>
          </div>
        </div>
      </template>

      <template #cell-phone="{ item }">
        <span :class="item.phone ? 'text-gray-700' : 'text-gray-400 italic'">
          {{ item.phone || 'Trống' }}
        </span>
      </template>

      <template #cell-membership="{ item }">
        <span
          v-if="item.membership"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827 1.035l-1.74 3.258 2.386.953a1 1 0 01.528 1.305l-1.127 2.818a3 3 0 01-1.077 1.458L10 18l-6.45-5.35a3 3 0 01-1.077-1.458l-1.127-2.818a1 1 0 01.528-1.305l2.386-.953-1.74-3.258a1 1 0 011.827-1.035l1.699 3.181L10 4.323V3a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ item.membership.level?.name || 'Thành viên' }}
        </span>
        <span v-else class="text-xs text-gray-400 italic">Chưa có hạng</span>
      </template>

      <template #cell-status="{ item }">
        <div class="flex justify-center">
          <span
            :class="`px-2.5 py-1 rounded-full text-xs font-bold border ${getUserStatusConfig(item.status).color}`"
          >
            {{ getUserStatusConfig(item.status).label }}
          </span>
        </div>
      </template>

      <template #cell-createdAt="{ item }">
        <span class="text-gray-500 text-sm">{{ formatDate(item.createdAt) }}</span>
      </template>
    </AdminDataTable>

    <AdminPagination v-if="pagination" :pagination="pagination" @page-change="handlePageChange" />
  </div>
</template>
