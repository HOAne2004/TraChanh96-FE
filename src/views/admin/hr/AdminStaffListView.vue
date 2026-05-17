<script setup>
import { onMounted, reactive, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

// Components
import PageHeader from '@/components/admin/shared/AdminPageHeader.vue'
import AdminDataTable from '@/components/admin/shared/AdminDataTable.vue'
import StoreStaffModal from '@/components/admin/store-operations/stafftab/StoreStaffModal.vue'

// Stores
import { useStaffStore } from '@/stores/identity/staff.store'
import { useStoreStore } from '@/stores/store-operations/store.store'

// Utils & Constants
import { formatPrice } from '@/utils/formatters'
import { getPositionOptions, getPositionConfig } from '@/constants/staff.constants'

const staffStore = useStaffStore()
const storeStore = useStoreStore()

const { staffs, loading } = storeToRefs(staffStore)
const { stores } = storeToRefs(storeStore)

// State Modal
const showModal = ref(false)
const selectedStaff = ref(null)

// --- STATE FILTER ---
const queryParams = reactive({
  search: '',
  storeId: '', // Filter theo cơ sở
  positionBackendKey: '', // Lọc nội bộ theo chức vụ
})

const positionOptions = getPositionOptions()
const getStoreName = (storeId) => {
  if (!storeId) return ''
  // Tìm trong mảng stores đã fetch ở dropdown
  const st = stores.value.find(s => s.id === storeId)
  return st ? st.name : `Cửa hàng (ID: ${storeId})`
}

// --- FETCH DATA ---
async function fetchData() {
  await Promise.all([
    // Truyền storeId nếu có, không truyền thì lấy tất cả
    staffStore.fetchStaffs({ 
      search: queryParams.search || undefined, 
      storeId: queryParams.storeId || undefined 
    }),
    
    stores.value.length === 0 ? storeStore.fetchActiveStores() : Promise.resolve()
  ])
}

// Xử lý Lọc nội bộ (Vì BE chưa có tham số Position)
const filteredStaffs = computed(() => {
  let list = staffs.value.filter(s => s.status !== 'Deleted')
  if (queryParams.positionBackendKey) {
    list = list.filter(s => s.position === queryParams.positionBackendKey)
  }
  return list
})

// --- HANDLERS ---
function handleCoreFilterChange(values) {
  queryParams.search = values.keyword
  fetchData()
}

function handleReset() {
  queryParams.storeId = ''
  queryParams.positionBackendKey = ''
}

function handleCreate() {
  selectedStaff.value = null
  showModal.value = true
}

function handleAction({ type, item }) {
  if (type === 'edit' || type === 'row-click') {
    selectedStaff.value = item
    showModal.value = true
  }
  if (type === 'delete') {
    if(confirm(`Bạn có chắc muốn xóa nhân sự ${item.fullName}?`)) {
       staffStore.deleteStaffAction(item.id)
    }
  }
}

onMounted(() => {
  fetchData()
})

// --- TABLE CONFIG ---
const columns = [
  { key: 'info', label: 'Nhân viên', class: 'min-w-[220px]' },
  { key: 'position', label: 'Chức vụ' },
  { key: 'store', label: 'Nơi làm việc' },
  { key: 'salary', label: 'Mức lương', class: 'text-right' },
]
</script>

<template>
  <div class="p-6">
    <PageHeader
      title="Quản lý Nhân sự"
      description="Quản lý nhân viên văn phòng và toàn bộ hệ thống cửa hàng"
      :show-create="true"
      @create="handleCreate"
      @change="handleCoreFilterChange"
      @reset="handleReset"
    >
      <template #filter-ext>
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">Cơ sở làm việc</label>
            <select
              v-model="queryParams.storeId"
              @change="fetchData"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Toàn hệ thống</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>

          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">Chức vụ</label>
            <select
              v-model="queryParams.positionBackendKey"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả chức vụ</option>
              <option v-for="opt in positionOptions" :key="opt.value" :value="opt.backendKey">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </template>
    </PageHeader>

    <AdminDataTable
      :items="filteredStaffs"
      :columns="columns"
      :loading="loading"
      :actions="['edit', 'delete']"
      @action="handleAction"
    >
      <template #cell-info="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
            <img :src="item.userAvatar || '/default-avatar.png'" class="w-full h-full object-cover" v-img-fallback="'drink'" />
          </div>
          <div>
            <div class="font-bold text-gray-900">{{ item.fullName }}</div>
            <div class="text-xs text-gray-500 flex items-center gap-1">
               {{ item.email }}
            </div>
          </div>
        </div>
      </template>

      <template #cell-position="{ item }">
        <span
          :class="`px-2.5 py-1 rounded-full text-xs font-bold border ${getPositionConfig(item.position).color}`"
        >
          {{ getPositionConfig(item.position).label }}
        </span>
      </template>

      <template #cell-store="{ item }">
        <div v-if="item.storeId" class="font-medium text-gray-800 text-sm">
          {{ item.storeName || item.store?.name || getStoreName(item.storeId) }}
        </div>
        <div v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-800 text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-5.94A2 2 0 0118 9.83v7.17a2 2 0 01-2 2h-6v-2.946zM15 15a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
          Văn phòng Tổng
        </div>
      </template>

      <template #cell-salary="{ item }">
        <div class="text-sm font-medium text-gray-900">
          <span v-if="item.hourlySalary">{{ formatPrice(item.hourlySalary) }}đ <span class="text-xs font-normal text-gray-500">/ giờ</span></span>
          <span v-else-if="item.baseSalary">{{ formatPrice(item.baseSalary) }}đ <span class="text-xs font-normal text-gray-500">/ tháng</span></span>
          <span v-else class="text-gray-400 italic">Chưa xét</span>
        </div>
      </template>
    </AdminDataTable>

    <StoreStaffModal 
      :is-open="showModal" 
      :store-id="null" 
      :staff-data="selectedStaff" 
      @close="showModal = false"
      @refresh="fetchData"
    />
  </div>
</template>