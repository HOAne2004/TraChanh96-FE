<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStoreStore } from '@/stores/storeStore'
import { useAppStore } from '@/stores/appStore'
import { storeToRefs } from 'pinia'

// Components
import StoreCard from '@/components/customer/card/StoreCard.vue'
import Button from '@/components/common/Button.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue' // Import Empty State

const storeStore = useStoreStore()
const appStore = useAppStore()

// Lấy dữ liệu và loading state
const { stores, loading: storeLoading } = storeToRefs(storeStore)
const { appConfig } = storeToRefs(appStore)

const pageLoading = ref(true)

onMounted(async () => {
  try {
    // Dùng Promise.all để tải song song
    await Promise.all([storeStore.fetchStores(), appStore.fetchAppConfig()])
  } catch (error) {
    console.error('Lỗi tải trang About Us:', error)
  } finally {
    pageLoading.value = false
  }
})

// 1. Lịch sử hình thành
const yearlyHistory = computed(() => {
  if (!stores.value || !stores.value.length) return []

  const groups = stores.value.reduce((acc, store) => {
    // Kiểm tra createdAt hợp lệ trước khi dùng
    if (!store.createdAt) return acc

    const year = new Date(store.createdAt).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(store)
    return acc
  }, {})

  // Sắp xếp năm giảm dần (Mới nhất lên đầu)
  const sortedYears = Object.keys(groups).sort((a, b) => b - a)

  return sortedYears.map((year) => ({
    year: year,
    count: groups[year].length,
    stores: groups[year]
      .slice(0, 3)
      .map((s) => s.name)
      .join(', '),
  }))
})

// 2. Cột mốc quan trọng (Sắp xếp theo thời gian tăng dần để thấy quá trình phát triển)
const sortedStores = computed(() => {
  if (!stores.value) return []
  return [...stores.value].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
})

const milestones = computed(() => {
  if (!sortedStores.value.length) return []
  // Lấy 3 cửa hàng ĐẦU TIÊN (cũ nhất) làm cột mốc khởi nghiệp
  return sortedStores.value.slice(0, 3).map((store) => ({
    date: new Date(store.createdAt).toLocaleDateString('vi-VN'),
    title: `Khai trương chi nhánh: ${store.name}`,
    address: store.address,
  }))
})

// 3. Hệ thống cửa hàng (Pagination)
const INITIAL_COUNT = 3
const itemsToShow = ref(INITIAL_COUNT)

// Danh sách hiển thị (Sắp xếp MỚI NHẤT lên đầu cho khách dễ tìm)
const storesForDisplay = computed(() => {
  if (!stores.value) return []
  return [...stores.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const visibleStore = computed(() => storesForDisplay.value.slice(0, itemsToShow.value))
const totalAvailable = computed(() => storesForDisplay.value.length)
const hasMore = computed(() => visibleStore.value.length < totalAvailable.value)

const loadMore = () => {
  itemsToShow.value += 3
}

const showLess = () => {
  itemsToShow.value = INITIAL_COUNT
  // Cuộn nhẹ về tiêu đề danh sách
  const el = document.getElementById('system-title')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <main class="py-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <section class="max-w-4xl mx-auto mb-12 px-4">
      <h1 class="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Câu chuyện thương hiệu
      </h1>

      <div
        class="h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden mb-6 shadow-lg"
      >
        <img
          :src="appConfig?.logoUrl || 'https://picsum.photos/1200/500?random=1'"
          alt="Câu chuyện thương hiệu"
          class="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
      </div>

      <div class="prose dark:prose-invert max-w-none text-center">
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          {{
            appConfig?.slogan ||
            'Hành trình mang hương vị trà chanh phố cổ đến với mọi miền tổ quốc.'
          }}
        </p>
      </div>
    </section>

    <section
      v-if="yearlyHistory.length > 0"
      class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl mb-12 mx-4"
    >
      <div class="md:col-span-1">
        <h2 class="text-xl font-bold mb-6 border-b pb-3 text-green-600 dark:text-green-400">
          Lịch sử hình thành
        </h2>
        <div class="space-y-8 relative pl-2">
          <div
            class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-green-200 dark:bg-green-700"
          ></div>

          <div v-for="item in yearlyHistory" :key="item.year" class="relative pl-8 group">
            <div
              class="absolute left-0 top-1.5 w-6 h-6 bg-white dark:bg-gray-800 border-4 border-green-500 rounded-full z-10 group-hover:scale-110 transition-transform"
            ></div>

            <p class="text-xl font-bold text-gray-800 dark:text-white">{{ item.year }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mở rộng thêm <span class="font-bold text-green-600">{{ item.count }}</span> chi nhánh.
            </p>
            <p class="text-xs text-gray-400 italic mt-1 truncate">VD: {{ item.stores }}...</p>
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <h2 class="text-xl font-bold mb-6 border-b pb-3 text-green-600 dark:text-green-400">
          Cột mốc đáng nhớ
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(item, index) in milestones"
            :key="index"
            class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 hover:shadow-md transition-all"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{{
                item.date
              }}</span>
            </div>
            <p class="font-bold text-gray-800 dark:text-white mb-1">{{ item.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </span>
              {{ item.address }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto text-center my-16 px-4">
      <div
        class="inline-block p-8 bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl shadow-lg text-white transform hover:-translate-y-1 transition-transform duration-300"
      >
        <h2 class="text-5xl font-extrabold mb-2 drop-shadow-md">{{ totalAvailable || '0' }}+</h2>
        <p class="text-xl font-medium opacity-90">Chi nhánh trên toàn quốc</p>
        <p class="text-sm mt-2 opacity-75">Và đang tiếp tục mở rộng...</p>
      </div>
    </section>

    <section id="system-title" class="max-w-6xl mx-auto px-4 pb-12">
      <h2
        class="text-2xl font-bold mb-8 border-l-4 border-green-600 pl-4 text-gray-800 dark:text-white"
      >
        Hệ thống cửa hàng
      </h2>

      <div v-if="pageLoading || storeLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>

      <div v-else-if="visibleStore.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StoreCard v-for="store in visibleStore" :key="store.id" :store="store" />
        </div>

        <div v-if="totalAvailable > INITIAL_COUNT" class="mt-10 flex justify-center space-x-4">
          <Button
            v-if="itemsToShow > INITIAL_COUNT"
            @click="showLess"
            label="Thu gọn"
            variant="secondary"
            :rounded="true"
          />
          <Button
            v-if="hasMore"
            @click="loadMore"
            label="Xem thêm chi nhánh"
            variant="primary"
            :rounded="true"
          />
        </div>
      </div>

      <CustomerEmptyState
        v-else
        type="search"
        title="Đang cập nhật hệ thống"
        message="Danh sách cửa hàng đang được chúng tôi cập nhật. Vui lòng quay lại sau."
      />
    </section>
  </main>
</template>
