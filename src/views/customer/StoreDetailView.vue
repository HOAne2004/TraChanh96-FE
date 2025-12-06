<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreStore } from '@/stores/storeStore'
import { storeToRefs } from 'pinia'
import NavLink from '@/components/common/NavLink.vue'
import defaultStoreImg from '@/assets/images/others/default-store.png' // Import ảnh mặc định

const route = useRoute()
const storeStore = useStoreStore()
const { stores, loading } = storeToRefs(storeStore) // Lấy loading state

const isLoadingLocal = ref(true)

const storeId = computed(() => Number(route.params.id))

// Tìm store trong danh sách (So sánh ID an toàn)
const currentStore = computed(() =>
    stores.value.find((s) => s.id === storeId.value)
)

// Xử lý ảnh
const fullImageUrl = computed(() => {
  if (!currentStore.value) return ''
  const url = currentStore.value.imageUrl
  if (!url) return defaultStoreImg
  if (url.startsWith('http')) return url
  return `https://trachanh96-be-production.up.railway.app${url}`
})

// Xử lý giờ (Cắt bỏ giây: 08:00:00 -> 08:00)
const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '...'

// Xử lý Link Google Map (Embed)
// Nếu BE có Latitude/Longitude thì dùng, không thì search theo Address
const mapSrc = computed(() => {
    if (!currentStore.value) return ''
    const address = encodeURIComponent(currentStore.value.address)
    // Dùng Google Maps Embed API (Free mode search)
    return `https://maps.google.com/maps?q=${address}&t=&z=15&ie=UTF8&iwloc=&output=embed`
})

onMounted(async () => {
  try {
    // Nếu danh sách store rỗng thì gọi API
    if (stores.value.length === 0) {
        await storeStore.fetchStores()
    }
  } finally {
    isLoadingLocal.value = false
  }
})

const isPageLoading = computed(() => loading.value || isLoadingLocal.value)
</script>

<template>
  <main class="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">

    <div v-if="isPageLoading" class="flex justify-center py-20">
       <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>

    <div v-else-if="!currentStore" class="text-center py-20">
      <h1 class="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Không tìm thấy cửa hàng!</h1>
      <p class="text-gray-500">Có thể cửa hàng này đã ngừng hoạt động hoặc đường dẫn không hợp lệ.</p>
      <NavLink to="/aboutUs" label="← Quay lại danh sách" variant="primary" class="mt-6 inline-flex" />
    </div>

    <div v-else>
        <div class="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <NavLink to="/aboutUs" label="Hệ thống cửa hàng" variant="secondary" />
          <span>/</span>
          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ currentStore.name }}</span>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video relative bg-gray-200">
            <img
              :src="fullImageUrl"
              :alt="currentStore.name"
              class="w-full h-full object-cover"
              @error="(e) => e.target.src = defaultStoreImg"
            />
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                    {{ currentStore.name }}
                </h1>
                <p class="text-lg text-gray-200 flex items-center gap-2 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {{ currentStore.address }}
                </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div class="lg:col-span-2 space-y-6">
                <div>
                    <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                        <span class="w-1 h-6 bg-green-600 rounded-full"></span>
                        Giờ hoạt động
                    </h2>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-3">
                        <div class="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">Mở cửa hàng ngày</p>
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                {{ formatTime(currentStore.openTime) }} - {{ formatTime(currentStore.closeTime) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                   <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                        <span class="w-1 h-6 bg-green-600 rounded-full"></span>
                        Bản đồ
                    </h2>
                    <div class="h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-600">
                        <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border:0"
                            :src="mapSrc"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>
             </div>

             <div class="lg:col-span-1">
                 <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 sticky top-24">
                    <h3 class="font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-600">Tiện ích tại quán</h3>
                    <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                       <li class="flex items-center gap-3">
                          <span class="text-green-500">✓</span> Wifi miễn phí tốc độ cao
                       </li>
                       <li class="flex items-center gap-3">
                          <span class="text-green-500">✓</span> Chỗ để xe rộng rãi
                       </li>
                       <li class="flex items-center gap-3">
                          <span class="text-green-500">✓</span> Thanh toán thẻ / QR Code
                       </li>
                       <li class="flex items-center gap-3">
                          <span class="text-green-500">✓</span> Máy lạnh mát mẻ
                       </li>
                    </ul>

                    <div class="mt-6 pt-4 border-t dark:border-gray-600">
                        <p class="text-xs text-gray-500 mb-1">Liên hệ chi nhánh:</p>
                        <a
                            v-if="currentStore.hotline"
                            :href="`tel:${currentStore.hotline}`"
                            class="text-lg font-bold text-green-600 hover:underline"
                        >
                            {{ currentStore.hotline }}
                        </a>
                        <span v-else class="text-gray-400 italic text-sm">Đang cập nhật số điện thoại</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>
    </div>
  </main>
</template>
