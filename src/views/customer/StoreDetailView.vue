<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import { storeToRefs } from 'pinia'
import NavLink from '@/components/common/NavLink.vue'
import defaultStoreImg from '@/assets/images/others/default-store.png'

// 👇 1. NHẬN PROPS TỪ ADMIN FORM
const props = defineProps({
  storeData: { type: Object, default: null }, // Dữ liệu từ Admin Form
  isPreview: { type: Boolean, default: false } // Cờ báo hiệu đang xem trước
})

const route = useRoute()
const storeStore = useStoreStore()
const { stores, loading } = storeToRefs(storeStore)

const isLoadingLocal = ref(false)

// 👇 2. LOGIC HYBRID: Ưu tiên Props trước, nếu không có mới tìm trong Store
const currentStore = computed(() => {
  // CASE A: PREVIEW MODE (Dữ liệu từ cha truyền vào)
  if (props.storeData) {
    return props.storeData
  }

  // CASE B: NORMAL MODE (Lấy từ URL)
  const storeSlug = route.params.slug
  return stores.value.find((s) => s.slug === storeSlug)
})

// Xử lý ảnh (Hỗ trợ cả Blob URL khi preview ảnh upload hoặc URL từ server)
const fullImageUrl = computed(() => {
  if (!currentStore.value) return ''
  const url = currentStore.value.imageUrl
  if (!url) return defaultStoreImg
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  return `https://trachanh96-be-production.up.railway.app${url}`
})

const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '...'

// Map Embed (Chỉ hiện khi không phải preview hoặc preview có data giả)
const mapSrc = computed(() => {
    if (!currentStore.value || !currentStore.value.address) return ''
    // Nếu object address phức tạp, cần lấy chuỗi fullAddress
    const addressStr = currentStore.value.address.fullAddress || currentStore.value.address || ''
    const addressEnc = encodeURIComponent(addressStr)
    return `https://maps.google.com/maps?q=${addressEnc}&t=&z=15&ie=UTF8&iwloc=&output=embed`
})

onMounted(async () => {
  // Chỉ gọi API khi KHÔNG PHẢI là Preview Mode
  if (!props.isPreview && !props.storeData) {
     if (stores.value.length === 0) {
        isLoadingLocal.value = true
        try {
           await storeStore.fetchStores() // Hoặc fetchActiveStores tùy logic
        } finally {
           isLoadingLocal.value = false
        }
     }
  }
})

const isPageLoading = computed(() => !props.isPreview && (loading.value || isLoadingLocal.value))
</script>

<template>
  <main :class="['max-w-6xl mx-auto', isPreview ? 'p-0 min-h-0' : 'py-8 px-4 sm:px-6 lg:px-8 min-h-screen']">

    <div v-if="isPageLoading" class="flex justify-center py-20">
       <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>

    <div v-else-if="!currentStore" class="text-center py-20">
      <h1 class="text-xl font-bold text-gray-700">Chưa có thông tin cửa hàng</h1>
      <p class="text-gray-500" v-if="!isPreview">Cửa hàng không tồn tại hoặc đã bị xóa.</p>
      <p class="text-gray-500" v-else>Vui lòng nhập liệu để xem trước.</p>
      <NavLink v-if="!isPreview" to="/aboutUs" label="← Quay lại" variant="primary" class="mt-6 inline-flex" />
    </div>

    <div v-else>
        <div v-if="!isPreview" class="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <NavLink to="/aboutUs" label="Hệ thống cửa hàng" variant="secondary" />
          <span>/</span>
          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ currentStore.name }}</span>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video relative bg-gray-200 group">
            <img
              :src="fullImageUrl"
              :alt="currentStore.name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              @error="(e) => e.target.src = defaultStoreImg"
            />
            <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20">
                <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                    {{ currentStore.name }}
                </h1>
                <p class="text-lg text-gray-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    {{ currentStore.address?.fullAddress || currentStore.address || 'Đang cập nhật địa chỉ' }}
                </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div class="lg:col-span-2 space-y-8">

                <div v-if="currentStore.description">
                    <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                        <span class="w-1 h-6 bg-orange-500 rounded-full"></span>
                        Giới thiệu
                    </h2>
                    <div class="prose prose-sm sm:prose max-w-none text-gray-600 dark:text-gray-300" v-html="currentStore.description"></div>
                </div>

                <div>
                    <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                        <span class="w-1 h-6 bg-green-600 rounded-full"></span>
                        Giờ hoạt động
                    </h2>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 flex items-center gap-4">
                        <div class="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-gray-900 dark:text-white text-lg">Mở cửa hàng ngày</p>
                            <p class="text-gray-600 dark:text-gray-300">
                                {{ formatTime(currentStore.openTime) }} - {{ formatTime(currentStore.closeTime) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="!isPreview || currentStore.address"> <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                        <span class="w-1 h-6 bg-blue-600 rounded-full"></span>
                        Bản đồ
                    </h2>
                    <div class="h-64 sm:h-80 bg-gray-100 rounded-xl overflow-hidden shadow-inner border">
                        <iframe width="100%" height="100%" frameborder="0" style="border:0" :src="mapSrc" allowfullscreen></iframe>
                    </div>
                </div>
             </div>

             <div class="lg:col-span-1">
                 <div class="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 sticky top-24">
                    <h3 class="font-bold text-lg mb-4 text-gray-900 dark:text-white pb-2 border-b">Tiện ích tại quán</h3>
                    <ul class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                       <li class="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <span>Wifi miễn phí tốc độ cao <br/>
                            <span v-if="currentStore.wifiPassword" class="text-xs text-gray-500 font-mono bg-gray-200 px-1 rounded">Pass: {{ currentStore.wifiPassword }}</span>
                          </span>
                       </li>
                       <li class="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                          Chỗ để xe rộng rãi
                       </li>
                       <li class="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                          Điều hòa mát lạnh
                       </li>
                    </ul>

                    <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p class="text-xs text-gray-500 mb-1 font-semibold uppercase">Liên hệ đặt bàn:</p>
                        <a
                            v-if="currentStore.phoneNumber"
                            :href="`tel:${currentStore.phoneNumber}`"
                            class="text-xl font-bold text-green-600 hover:text-green-700 block"
                        >
                            {{ currentStore.phoneNumber }}
                        </a>
                        <span v-else class="text-gray-400 italic text-sm">Chưa cập nhật SĐT</span>
                    </div>
                 </div>
             </div>
          </div>
        </div>
    </div>
  </main>
</template>
