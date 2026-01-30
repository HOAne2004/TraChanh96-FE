<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import { storeToRefs } from 'pinia'
import NavLink from '@/components/common/NavLink.vue'
import ProductCard from '@/components/customer/card/ProductCard.vue'
import defaultStoreImg from '@/assets/images/others/default-store.png'

// 👇 1. KHÔI PHỤC PROPS (Cho Admin Preview)
const props = defineProps({
  storeData: { type: Object, default: null }, // Dữ liệu từ Admin Form truyền vào
  isPreview: { type: Boolean, default: false }, // Cờ báo hiệu đang xem trước
})

const route = useRoute()
const storeStore = useStoreStore()
const { stores, storeMenu, loading } = storeToRefs(storeStore)

const isLoadingLocal = ref(false)
const activeCategoryId = ref('all') // State cho bộ lọc danh mục

// 👇 2. LOGIC DATA: Hybrid (Preview vs Real)
const currentStore = computed(() => {
  // A. Chế độ xem trước (Admin)
  if (props.isPreview && props.storeData) {
    return props.storeData
  }
  // B. Chế độ thực tế (Customer)
  // Logic lấy từ Store (đã fetch ở onMounted)
  return (
    storeStore.currentStore ||
    stores.value.find((s) => s.slug === route.params.slug || s.id == route.params.id)
  )
})

// 👇 3. LOGIC MENU & CATEGORY
// Lấy danh sách danh mục từ Menu thực tế
const categories = computed(() => {
  if (!storeMenu.value || storeMenu.value.length === 0) return []

  // Lọc ra các category unique
  const uniqueCats = new Map()
  storeMenu.value.forEach((item) => {
    if (!uniqueCats.has(item.categoryId)) {
      uniqueCats.set(item.categoryId, {
        id: item.categoryId,
        name: item.categoryName || 'Khác',
      })
    }
  })
  return Array.from(uniqueCats.values())
})

// Lọc sản phẩm theo danh mục đang chọn
const displayedProducts = computed(() => {
  // 1. Nếu là Preview Mode (Admin) -> Trả về rỗng
  if (props.isPreview) return []

  // 2. Lấy danh sách gốc từ Store
  let products = storeMenu.value || []

  // 3. 🔥 SỬA LOGIC FILTER: Chỉ lọc khi activeCategoryId KHÁC 'all'
  if (activeCategoryId.value !== 'all') {
    products = products.filter((p) => p.categoryId === activeCategoryId.value)
  }

  // 4. Map dữ liệu để khớp với ProductCard (productId -> id)
  return products.map((p) => ({
    ...p,
    id: p.id,
    basePrice: p.displayPrice || p.basePrice, // Ưu tiên giá override tại quán
  }))
})

// 👇 4. HELPERS HIỂN THỊ
const fullImageUrl = computed(() => {
  if (!currentStore.value) return ''
  const url = currentStore.value.imageUrl
  if (!url) return defaultStoreImg
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  // Nếu cần prefix domain
  return url
})

const formatTime = (timeStr) => (timeStr ? timeStr.substring(0, 5) : '...')

const mapSrc = computed(() => {
  if (!currentStore.value || !currentStore.value.address) return ''
  // Handle case address object or string
  const addressStr =
    typeof currentStore.value.address === 'string'
      ? currentStore.value.address
      : currentStore.value.address?.fullAddress || ''

  const addressEnc = encodeURIComponent(addressStr)
  return `https://maps.google.com/maps?q=${addressEnc}&t=&z=15&ie=UTF8&iwloc=&output=embed`
})

// 👇 5. LIFECYCLE
const loadData = async () => {
  // Nếu đang Preview thì không gọi API
  if (props.isPreview) return

  const slugOrId = route.params.slug || route.params.id
  if (!slugOrId) return

  isLoadingLocal.value = true
  try {
    // A. Lấy thông tin cửa hàng
    let storeId = null

    // Check nếu URL là ID hay Slug
    if (!isNaN(slugOrId)) {
      storeId = Number(slugOrId)
      await storeStore.fetchStoreById(storeId)
      // Cập nhật currentStore trong Pinia để UI react
      storeStore.currentStore = storeStore.stores.find((s) => s.id === storeId)
    } else {
      await storeStore.fetchStoreBySlug(slugOrId)
      storeId = storeStore.currentStore?.id
    }

    // B. Lấy Menu
    if (storeId) {
      storeStore.setSelectedStore(storeId) // Set context để ProductCard biết
      await storeStore.fetchStoreMenu(storeId)
    }
  } finally {
    isLoadingLocal.value = false
  }
}

onMounted(loadData)
watch(() => route.params.slug, loadData)

const isPageLoading = computed(() => !props.isPreview && (loading.value || isLoadingLocal.value))
</script>

<template>
  <main
    :class="[
      'max-w-7xl mx-auto',
      isPreview ? 'p-0 min-h-0' : 'py-8 px-4 sm:px-6 lg:px-8 min-h-screen',
    ]"
  >
    <div v-if="isPageLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>

    <div v-else-if="!currentStore" class="text-center py-20">
      <h1 class="text-xl font-bold text-gray-700">Thông tin cửa hàng chưa khả dụng</h1>
      <p class="text-gray-500 mt-2" v-if="isPreview">
        Vui lòng nhập thông tin cơ bản để xem trước.
      </p>
      <NavLink
        v-else
        to="/"
        label="← Quay lại trang chủ"
        variant="primary"
        class="mt-6 inline-flex"
      />
    </div>

    <div v-else>
      <div v-if="!isPreview" class="mb-6 text-sm text-gray-500 flex items-center gap-2">
        <NavLink to="/" label="Trang chủ" variant="secondary" />
        <span>/</span>
        <span class="font-semibold text-gray-800 dark:text-gray-200">{{ currentStore.name }}</span>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl mb-10">
        <div
          class="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-[21/9] relative bg-gray-200 group"
        >
          <img
            :src="fullImageUrl"
            :alt="currentStore.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            @error="(e) => (e.target.src = defaultStoreImg)"
          />
          <div
            class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20"
          >
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
              {{ currentStore.name }}
            </h1>
            <p class="text-lg text-gray-200 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{
                typeof currentStore.address === 'string'
                  ? currentStore.address
                  : currentStore.address?.fullAddress || 'Đang cập nhật địa chỉ'
              }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div v-if="currentStore.description">
              <h2
                class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"
              >
                <span class="w-1 h-6 bg-orange-500 rounded-full"></span>
                Giới thiệu
              </h2>
              <div
                class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300"
                v-html="currentStore.description"
              ></div>
            </div>

            <div v-if="!isPreview || currentStore.address">
              <h2
                class="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-white"
              >
                <span class="w-1 h-6 bg-blue-600 rounded-full"></span>
                Vị trí
              </h2>
              <div
                class="h-64 bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200"
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameborder="0"
                  style="border: 0"
                  :src="mapSrc"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1 space-y-6">
            <div
              class="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800"
            >
              <h3
                class="font-bold text-lg mb-3 text-green-800 dark:text-green-400 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Giờ mở cửa
              </h3>
              <p class="text-2xl font-bold text-gray-800 dark:text-white">
                {{ formatTime(currentStore.openTime) }} - {{ formatTime(currentStore.closeTime) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Mở cửa tất cả các ngày trong tuần</p>
            </div>

            <div
              class="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <h3 class="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">
                Tiện ích
              </h3>
              <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li class="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-green-500 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span
                    >Wifi miễn phí <br />
                    <span
                      v-if="currentStore.wifiPassword"
                      class="text-xs text-gray-500 font-mono bg-gray-200 px-1 rounded"
                      >Pass: {{ currentStore.wifiPassword }}</span
                    >
                  </span>
                </li>
                <li class="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Điều hòa mát lạnh
                </li>
              </ul>
              <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p class="text-xs text-gray-500 mb-1 font-semibold uppercase">Hotline:</p>
                <a
                  v-if="currentStore.phoneNumber"
                  :href="`tel:${currentStore.phoneNumber}`"
                  class="text-xl font-bold text-green-600 hover:text-green-700 block"
                >
                  {{ currentStore.phoneNumber }}
                </a>
                <span v-else class="text-gray-400 italic text-sm">Đang cập nhật</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="menu-section" class="mt-12" v-if="!isPreview">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <span class="p-2 bg-green-100 rounded-lg text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </span>
          Thực đơn
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div class="md:col-span-1 sticky top-24">
            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div
                class="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 font-bold text-gray-700 dark:text-white"
              >
                Danh mục món
              </div>
              <ul class="flex flex-col">
                <li>
                  <button
                    @click="activeCategoryId = 'all'"
                    class="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-l-4"
                    :class="
                      activeCategoryId === 'all'
                        ? 'border-green-500 text-green-700 font-bold bg-green-50'
                        : 'border-transparent text-gray-600'
                    "
                  >
                    Tất cả món
                  </button>
                </li>
                <li v-for="cat in categories" :key="cat.id">
                  <button
                    @click="activeCategoryId = cat.id"
                    class="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-l-4"
                    :class="
                      activeCategoryId === cat.id
                        ? 'border-green-500 text-green-700 font-bold bg-green-50'
                        : 'border-transparent text-gray-600'
                    "
                  >
                    {{ cat.name }}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div class="md:col-span-3">
            <div
              v-if="displayedProducts.length === 0"
              class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300"
            >
              <p class="text-gray-500 text-lg">Chưa có món nào trong danh mục này.</p>
              <button
                v-if="activeCategoryId !== 'all'"
                @click="activeCategoryId = 'all'"
                class="text-green-600 font-bold mt-2 hover:underline"
              >
                Xem tất cả món
              </button>
            </div>

            <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCard
                v-for="product in displayedProducts"
                :key="product.productId"
                :product="product"
                class="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center text-yellow-800"
      >
        <span class="font-bold">Chế độ xem trước:</span> Phần thực đơn sẽ hiển thị sau khi cửa hàng
        được tạo và thêm món ăn.
      </div>
    </div>
  </main>
</template>
