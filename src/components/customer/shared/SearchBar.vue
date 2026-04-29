<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProductStore } from '@/stores/catalog/product.store'
//import Button from '@/components/ui/AppButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const productStore = useProductStore()
const query = ref('')
const showDropdown = ref(false)
const searchBarRef = ref(null)

// Gọi dữ liệu sản phẩm 1 lần khi load
onMounted(async () => {
  await productStore.fetchProducts()
})

// Lọc gợi ý dựa theo query
const filteredSuggestions = computed(() => {
  if (!query.value.trim()) return []
  const lower = query.value.toLowerCase()
  return productStore.products.filter((p) => p.name.toLowerCase().includes(lower))
})

// Khi click ra ngoài thì ẩn dropdown
const handleClickOutside = (e) => {
  if (searchBarRef.value && !searchBarRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Khi chọn gợi ý
const selectSuggestion = (item) => {
  query.value = item.name
  showDropdown.value = false
  search()
}

// Khi nhấn nút tìm kiếm
const search = () => {
  if (!query.value.trim()) return
  showDropdown.value = false
  // 👉 Điều hướng đến trang kết quả tìm kiếm
  router.push({ path: '/search', query: { q: query.value } })
}
</script>

<template>
  <div ref="searchBarRef" class="relative w-full sm:max-w-sm">
    <!-- Thanh tìm kiếm -->
    <div
      class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/60 transition"
    >
      <input
        v-model="query"
        @focus="showDropdown = true"
        type="text"
        placeholder="Tìm kiếm..."
        class="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 px-2 text-sm sm:text-base"
      />
      <button
        class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        @click="search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5 text-gray-600 dark:text-gray-300"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.64 5.64a7.5 7.5 0 0 0 10.61 10.61Z"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown gợi ý -->
    <transition name="fade">
      <ul
        v-if="showDropdown && filteredSuggestions.length"
        class="absolute left-0 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
      >
        <li
          v-for="item in filteredSuggestions"
          :key="item.id"
          @click="selectSuggestion(item)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm sm:text-base"
        >
          {{ item.name }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
