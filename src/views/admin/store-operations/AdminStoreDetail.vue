<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store-operations/store.store'

import StoreInfoTab from '@/components/admin/store-operations/StoreInfoTab.vue'
import StoreOverviewTab from '@/components/admin/store-operations/StoreOverviewTab.vue'
import StoreMenuTab from '@/components/admin/store-operations/StoreMenuTab.vue'
import StoreRoomsTab from '@/components/admin/store-operations/StoreRoomsTab.vue'
import StoreStaffTab from '@/components/admin/store-operations/stafftab/StoreStaffTab.vue'
import StoreReservationTab from '@/components/admin/store-operations/StoreReservationTab.vue'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()

const storeId = computed(() => route.params.id ? Number(route.params.id) : null)
const isCreateMode = computed(() => !storeId.value)
const storeDetail = ref(null)
const loading = ref(true)

// Nếu là tạo mới, luôn chọn 'info'. Nếu không, lấy từ url hoặc mặc định 'overview'
const activeTab = ref(isCreateMode.value ? 'info' : (route.query.tab || 'overview'))

// Đồng bộ tab xuống URL
watch(activeTab, (newTab) => {
  if (route.query.tab !== newTab) {
    router.replace({ query: { ...route.query, tab: newTab } })
  }
})

// Mảng danh sách các tab kèm icon (SVG)
const tabs = [
  { id: 'overview', name: 'Tổng quan', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />' },
  { id: 'menu', name: 'Thực đơn', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />' },
  { id: 'rooms', name: 'Phòng & Bàn', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />' },
  { id: 'staff', name: 'Nhân viên', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />' },
  { id: 'reservations', name: 'Đặt bàn', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />' },
  { id: 'info', name: 'Cấu hình chung', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />' }
]

const visibleTabs = computed(() => {
  if (isCreateMode.value) return [tabs[0]]
  return tabs
})

const fetchStoreData = async () => {
  if (isCreateMode.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    storeDetail.value = await storeStore.fetchAdminStoreById(storeId.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchStoreData)

</script>

<template>
  <div class="px-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push({ name: 'admin.stores' })"
          class="p-2 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ isCreateMode ? 'Thêm cửa hàng mới' : (storeDetail?.name || 'Chi tiết cửa hàng') }}
          </h1>
          <p class="text-sm text-gray-500 font-medium">{{ isCreateMode ? 'Thiết lập thông tin cơ bản cho cửa hàng' : storeDetail?.address }}</p>
        </div>
      </div>
      <div v-if="!isCreateMode && storeDetail" class="flex items-center gap-2">
         <span
            class="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
            :class="{
              'bg-green-100 text-green-700 border border-green-200': storeDetail.status === 'Active',
              'bg-yellow-100 text-yellow-700 border border-yellow-200': storeDetail.status === 'ComingSoon',
              'bg-red-100 text-red-700 border border-red-200':
                storeDetail.status === 'PermanentlyClosed' || storeDetail.status === 'TemporarilyClosed',
            }"
          >
            {{ storeDetail.status }}
          </span>
      </div>
    </div>

    <!-- Tabs Navigation (Chỉ hiện khi chỉnh sửa hoặc tạo xong) -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden p-1.5" v-if="!isCreateMode">
      <nav class="flex overflow-x-auto gap-2">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap rounded-xl"
          :class="
            activeTab === tab.id
              ? 'bg-green-600 text-white shadow-md shadow-green-200'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          "
        >
          <!-- SVG Icon -->
          <svg v-html="tab.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 opacity-90"></svg>
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Content Area -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin h-8 w-8 text-green-500 border-4 border-current border-t-transparent rounded-full shadow-sm"></div>
    </div>
    <div v-else-if="!isCreateMode && !storeDetail" class="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div class="text-gray-400 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-gray-500 font-medium">Không tìm thấy cửa hàng</p>
    </div>
    <div v-else class="transition-all duration-300">
      <StoreInfoTab v-if="activeTab === 'info'" :store="storeDetail" :isEditMode="!isCreateMode" @saved="fetchStoreData" />
      <StoreOverviewTab v-if="activeTab === 'overview'" :store="storeDetail" />
      <StoreMenuTab v-if="activeTab === 'menu'" :store="storeDetail" />
      <StoreRoomsTab v-if="activeTab === 'rooms'" :store="storeDetail" />
      <StoreStaffTab v-if="activeTab === 'staff'" :store="storeDetail" />
      <StoreReservationTab v-if="activeTab === 'reservations'" :store="storeDetail" />
    </div>
  </div>
</template>
