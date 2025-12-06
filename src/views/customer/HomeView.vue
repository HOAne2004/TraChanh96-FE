<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

// Components
import HeroCarousel from '@/components/customer/HeroCarousel.vue'
import TitledContainer from '@/components/customer/TitledContainer.vue'
import ProductCard from '@/components/customer/card/ProductCard.vue'
import NewsCard from '@/components/customer/card/NewsCard.vue'
import StoreCard from '@/components/customer/card/StoreCard.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue' // Import Empty State

// Stores
import { useProductStore } from '@/stores/productStore'
import { useNewsStore } from '@/stores/newsStore'
import { useStoreStore } from '@/stores/storeStore'

const productStore = useProductStore()
const newsStore = useNewsStore()
const storeStore = useStoreStore()

// Lấy thêm state 'isLoading' nếu store có hỗ trợ (để tránh hiện Empty khi đang tải)
// Giả định store bạn có biến loading tương ứng
const { products, productLoading } = storeToRefs(productStore)
const { news } = storeToRefs(newsStore)
const { stores } = storeToRefs(storeStore)

onMounted(async () => {
  // Promise.allSettled tốt hơn Promise.all để 1 cái lỗi không làm chết cả trang
  await Promise.allSettled([
    productStore.fetchProduct(),
    newsStore.fetchNews(),
    storeStore.fetchStores(),
  ])
})

// --- Computed Logic ---
const topProducts = computed(() => {
  return (
    products.value
      ?.slice()
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10) || []
  )
})

const lastestProducts = computed(() =>
  products.value
    ? [...products.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
    : [],
)

const latestNews = computed(() =>
  news.value ? [...news.value].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5) : [],
)

const latestStores = computed(() =>
  stores.value
    ? [...stores.value].sort((a, b) => new Date(b.openDate) - new Date(a.openDate)).slice(0, 5)
    : [],
)
</script>

<template>
  <main class="bg-gray-100 dark:bg-gray-900 min-h-screen pb-12">
    <HeroCarousel />

    <TitledContainer title="Sản phẩm nổi bật" linkTo="/products">
      <div v-if="productLoading" class="col-span-full text-center py-8 text-gray-500">
        Đang tải sản phẩm...
      </div>

      <div
        v-else-if="topProducts.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <ProductCard v-for="p in topProducts" :key="p.id" :product="p" />
      </div>

      <CustomerEmptyState
        v-else
        type="search"
        title="Danh sách đang cập nhật"
        message="Chúng tôi đang chuẩn bị những món ngon nhất cho bạn."
        class="col-span-full py-8"
      />
    </TitledContainer>

    <TitledContainer title="Sản phẩm mới" linkTo="/products">
      <div
        v-if="lastestProducts.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <ProductCard v-for="p in lastestProducts" :key="p.id" :product="p" />
      </div>

      <div v-else class="col-span-full text-center text-gray-400 italic py-4">
        Đang cập nhật món mới...
      </div>
    </TitledContainer>

    <div v-if="latestNews.length > 0">
      <TitledContainer title="Tin tức nổi bật" linkTo="/news">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NewsCard v-for="n in latestNews" :key="n.id" :news="n" />
        </div>
      </TitledContainer>
    </div>
   
    <TitledContainer title="Hệ thống cửa hàng" linkTo="/aboutUs">
      <div v-if="latestStores.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StoreCard v-for="s in latestStores" :key="s.id" :store="s" />
      </div>

      <CustomerEmptyState
        v-else
        type="search"
        title="Hệ thống cửa hàng"
        message="Chúng tôi đang mở rộng chi nhánh gần bạn."
        class="col-span-full py-8"
      />
    </TitledContainer>
  </main>
</template>
