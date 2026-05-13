<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { formatPrice } from '@/utils/formatters'
import AdminPagination from '@/components/admin/shared/AdminPagination.vue'

const props = defineProps({
  store: { type: Object, required: true }
})

const storeStore = useStoreStore()
const loading = ref(false)
const search = ref('')
const selectedCategory = ref('all')

// --- PHÂN TRANG LOCAL ---
const currentPage = ref(1)
const pageSize = ref(12) // Hiển thị 12 món mỗi trang (Lưới 3 hoặc 4 cột đều đẹp)

onMounted(async () => {
  loading.value = true
  await storeStore.fetchStoreMenu(props.store.id)
  loading.value = false
})

// 1. Lấy danh sách category duy nhất để làm bộ lọc
const categories = computed(() => {
  const cats = storeStore.storeMenu.map(i => i.categoryName).filter(Boolean)
  return ['all', ...new Set(cats)]
})

// 2. Logic Lọc (Search + Category)
const filteredItems = computed(() => {
  let items = storeStore.storeMenu || []
  
  if (search.value) {
    items = items.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  
  if (selectedCategory.value !== 'all') {
    items = items.filter(i => i.categoryName === selectedCategory.value)
  }
  
  return items
})

// 3. Logic Phân trang
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const paginationInfo = computed(() => ({
  pageIndex: currentPage.value,
  pageSize: pageSize.value,
  totalRecords: filteredItems.value.length,
  totalPages: Math.ceil(filteredItems.value.length / pageSize.value)
}))

const handlePageChange = (page) => {
  currentPage.value = page
  // Scroll lên đầu tab khi đổi trang
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleProductStatus = async (item) => {
  // Gọi API cập nhật trạng thái tại storeId
  // Ví dụ: await storeStore.updateProductStatusAtStoreAsync({ productId: item.id, storeId: props.store.id, status: ... })
  item.isActive = !item.isActive 
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="relative w-full md:max-w-md">
        <input 
          v-model="search"
          type="text" 
          placeholder="Tìm tên món ăn, đồ uống..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm outline-none transition-all shadow-sm"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="flex gap-2 w-full md:w-auto">
        <select 
          v-model="selectedCategory"
          class="flex-1 md:w-48 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
        >
          <option value="all">Tất cả danh mục</option>
          <option v-for="cat in categories.filter(c => c !== 'all')" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center flex flex-col items-center gap-3">
      <div class="animate-spin h-10 w-10 text-green-500 border-4 border-current border-t-transparent rounded-full"></div>
      <span class="text-gray-500 font-bold">Đang tải thực đơn...</span>
    </div>
    
    <div v-else-if="filteredItems.length === 0" class="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-100">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-gray-300">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
      <p class="font-bold text-lg">Không tìm thấy sản phẩm</p>
      <p class="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
    </div>
    
    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="item in paginatedItems" 
          :key="item.id" 
          class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
        >
          <div class="relative aspect-video overflow-hidden bg-gray-100">
            <img 
              :src="item.imageUrl || '/default-drink.png'" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute top-2 left-2">
              <span class="px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-bold text-green-700 uppercase">
                {{ item.categoryName || 'Khác' }}
              </span>
            </div>
            <div class="absolute top-2 right-2">
              <button 
                @click="toggleProductStatus(item)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-sm"
                :class="item.isActive !== false ? 'bg-green-500' : 'bg-gray-400'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="item.isActive !== false ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>

          <div class="p-4">
            <h4 class="font-bold text-gray-900 mb-1 truncate group-hover:text-green-600 transition-colors">
              {{ item.name }}
            </h4>
            <div class="flex justify-between items-end mt-3">
              <div class="flex flex-col">
                <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Giá bán tại quán</span>
                <span class="text-lg font-black text-green-600 leading-none">
                  {{ formatPrice(item.displayPrice || item.basePrice) }}đ
                </span>
              </div>
              <div 
                class="text-[10px] font-bold px-2 py-1 rounded-md"
                :class="item.isActive !== false ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'"
              >
                {{ item.isActive !== false ? 'ĐANG BÁN' : 'TẠM NGƯNG' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center border-t border-gray-100 pt-6">
        <AdminPagination 
          :pagination="paginationInfo" 
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hiệu ứng mượt cho các card */
.grid-enter-active, .grid-leave-active {
  transition: all 0.5s ease;
}
.grid-enter-from, .grid-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>