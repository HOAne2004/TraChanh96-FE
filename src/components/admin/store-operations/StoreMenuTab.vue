<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStoreStore } from '@/stores/store-operations/store.store'

const props = defineProps({
  store: { type: Object, required: true }
})

const storeStore = useStoreStore()
const loading = ref(false)
const search = ref('')

onMounted(async () => {
  loading.value = true
  await storeStore.fetchStoreMenu(props.store.id)
  loading.value = false
})

const menuItems = computed(() => {
  let items = storeStore.storeMenu || []
  if (search.value) {
    items = items.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  return items
})

const toggleProductStatus = async (item) => {
  // Thực tế sẽ gọi API cập nhật trạng thái sản phẩm ở cửa hàng
  // VD: await storeStore.updateStoreProductStatus(props.store.id, item.id, !item.isActive)
  item.isActive = !item.isActive
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="p-4 border-b border-gray-200 bg-gray-50/50">
      <div class="relative max-w-sm">
        <input 
          v-model="search"
          type="text" 
          placeholder="Tìm kiếm sản phẩm..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 text-sm outline-none transition-colors"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="p-12 text-center flex justify-center items-center gap-2">
      <div class="animate-spin h-5 w-5 text-green-500 border-2 border-current border-t-transparent rounded-full"></div>
      <span class="text-gray-500 font-medium">Đang tải thực đơn...</span>
    </div>
    
    <div v-else-if="menuItems.length === 0" class="p-12 flex flex-col items-center justify-center text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-300 mb-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      Không tìm thấy sản phẩm
    </div>
    
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50/80">
        <tr>
          <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên SP</th>
          <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
          <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái (Bật/Tắt)</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr v-for="item in menuItems" :key="item.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <img v-if="item.imageUrl" :src="item.imageUrl" class="w-10 h-10 rounded-lg object-cover border" />
              <div v-else class="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.categoryName || 'Khác' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <button 
              @click="toggleProductStatus(item)"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              :class="item.isActive !== false ? 'bg-green-500' : 'bg-gray-300'"
            >
              <span 
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="item.isActive !== false ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
