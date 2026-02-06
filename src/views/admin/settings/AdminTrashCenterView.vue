<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { TRASH_MODULES } from '@/configs/trash.config' // 🟢 Import Config
import { formatDate, formatPrice } from '@/utils/formatters'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'
import { useToastStore } from '@/stores/toast'

// --- STATE ---
const activeTab = ref(Object.keys(TRASH_MODULES)[0]) // Mặc định chọn tab đầu tiên
const loading = ref(false)
const toast = useToastStore()

// --- COMPUTED: Lấy cấu hình của Tab hiện tại ---
const currentConfig = computed(() => TRASH_MODULES[activeTab.value])

// Khởi tạo Store động dựa trên cấu hình
const currentStore = computed(() => {
  if (!currentConfig.value) return null
  return currentConfig.value.useStore() // Gọi hàm useStore() của Pinia
})

// Lấy danh sách items từ store động
// ⚠️ QUAN TRỌNG: Các Store phải thống nhất tên state chứa list (vd: 'items' hoặc 'trashItems')
// Nếu Store Order dùng 'orders', Product dùng 'products', ta cần map lại.
const currentItems = computed(() => {
  const store = currentStore.value
  if (!store) return []
  
  // Cách 1: Chuẩn hóa store (tất cả store đều có state `trashItems`)
  // Cách 2: Map thủ công nếu tên khác nhau (như bên dưới)
  if (activeTab.value === 'products') return store.products
  if (activeTab.value === 'orders') return store.orders
  // if (activeTab.value === 'users') return store.users
  return []
})

// --- ACTIONS ---
const fetchData = async () => {
  if (!currentStore.value) return
  
  loading.value = true
  try {
    const actionName = currentConfig.value.fetchAction
    const params = currentConfig.value.fetchParams
    
    // Gọi action động: store['fetchProducts'](params)
    await currentStore.value[actionName](params)
  } catch (err) {
    console.error(err)
    toast.show({ type: 'error', message: 'Lỗi tải dữ liệu' })
  } finally {
    loading.value = false
  }
}

const onRestore = async (item) => {
  if (!confirm(`Khôi phục dữ liệu #${item.id || item.orderCode}?`)) return
  
  try {
    const actionName = currentConfig.value.restoreAction
    // Gọi action restore động
    await currentStore.value[actionName](item.id)
    
    // Fetch lại sau khi restore (nếu store không tự update list)
    await fetchData()
  } catch (err) {
    // Error đã được handle trong store hoặc toast ở đây
  }
}

watch(activeTab, fetchData)
onMounted(fetchData)
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-3 bg-red-100 rounded-full text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Thùng rác hệ thống</h1>
        <p class="text-sm text-gray-500">Dữ liệu đã xóa sẽ được lưu trong 30 ngày.</p>
      </div>
    </div>

    <div class="flex gap-2 mb-6 border-b overflow-x-auto">
      <button
        v-for="(config, key) in TRASH_MODULES"
        :key="key"
        @click="activeTab = key"
        :class="['flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap', activeTab === key ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-700']"
      >
        <svg v-if="config.icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" :d="config.icon" /></svg>
        {{ config.label }}
      </button>
    </div>

    <div class="bg-white rounded-xl shadow p-4 min-h-[400px]">
      <AdminDataTable
        :items="currentItems"
        :columns="currentConfig.columns"
        :loading="loading"
        :pagination="null"
      >
        <template #cell-imageUrl="{ value }">
           <img :src="value || '/default.png'" class="w-10 h-10 object-cover rounded border" />
        </template>

        <template v-for="col in currentConfig.columns.filter(c => c.type === 'price')" #[`cell-${col.key}`]="{ value }">
           {{ formatPrice(value) }} đ
        </template>

        <template v-for="col in currentConfig.columns.filter(c => c.type === 'date')" #[`cell-${col.key}`]="{ value }">
           {{ formatDate(value) }}
        </template>

        <template #cell-status="{ value }">
           <span class="px-2 py-0.5 rounded text-xs border bg-gray-100 text-gray-600">{{ value }}</span>
        </template>

        <template #action="{ item }">
          <button @click="onRestore(item)" class="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-bold transition-colors">
            Khôi phục
          </button>
        </template>

      </AdminDataTable>
    </div>
  </div>
</template>