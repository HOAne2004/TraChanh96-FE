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
import { useProductStore } from '@/stores/product'
import { useNewsStore } from '@/stores/news'
import { useStoreStore } from '@/stores/store'

const productStore = useProductStore()
const newsStore = useNewsStore()
const storeStore = useStoreStore()

// Lấy thêm state 'isLoading' nếu store có hỗ trợ (để tránh hiện Empty khi đang tải)
// Giả định store bạn có biến loading tương ứng
const {
    loading: productLoading,
    bestSellingProducts, // Top 10 Bán chạy
    newestProducts       // Top 10 Mới nhất
} = storeToRefs(productStore)
const { publishedNews } = storeToRefs(newsStore)
const { stores } = storeToRefs(storeStore)

onMounted(async () => {
  // Promise.allSettled tốt hơn Promise.all để 1 cái lỗi không làm chết cả trang
  await Promise.allSettled([
    productStore.fetchProducts(),
    newsStore.fetchPublishedNews(),
    storeStore.fetchActiveStores(),
  ])
})

const latestNews = computed(() =>
  publishedNews.value
    ? [...publishedNews.value]
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .slice(0, 5)
    : [],
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

    <TitledContainer
      title="Sản phẩm nổi bật"
      linkTo="/products?sort=best_seller"
      :items="bestSellingProducts"
    >
      <template #default="{ items }">
        <div v-if="productLoading" class="w-full text-center py-10 text-gray-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          Đang tải sản phẩm...
        </div>

        <template v-else-if="items && items.length > 0">
          <ProductCard
            v-for="p in items"
            :key="p.id"
            :product="p"
            class="min-w-[200px] md:min-w-[240px] snap-center"
          />
        </template>

        <div v-else class="w-full">
          <CustomerEmptyState
            type="search"
            title="Danh sách đang cập nhật"
            message="Chúng tôi đang chuẩn bị những món ngon nhất cho bạn."
          />
        </div>
      </template>
    </TitledContainer>

    <TitledContainer
      title="Sản phẩm mới"
      linkTo="/products?sort=newest"
      :items="newestProducts"
    >
      <template #default="{ items }">
        <div v-if="productLoading" class="w-full text-center py-10 text-gray-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          Đang tải sản phẩm...
        </div>

        <template v-else-if="items && items.length > 0">
          <ProductCard
            v-for="p in items"
            :key="p.id"
            :product="p"
            class="min-w-[200px] md:min-w-[240px] snap-center"
          />
        </template>

        <div v-else class="w-full">
          <CustomerEmptyState
            type="search"
            title="Sản phẩm mới"
            message="Chưa có sản phẩm mới nào."
          />
        </div>
      </template>
    </TitledContainer>

    <TitledContainer
      title="Tin tức nổi bật"
      linkTo="/news"
      :items="latestNews"
    >
      <template #default="{ items }">
        <template v-if="items && items.length > 0">
          <NewsCard
            v-for="n in items"
            :key="n.id"
            :news="n"
            class="min-w-[280px] md:min-w-[320px] snap-center"
          />
        </template>

        <div v-else class="w-full">
          <CustomerEmptyState
            type="search"
            title="Tin tức nổi bật"
            message="Chúng tôi đang cập nhật tin tức mới nhất."
          />
        </div>
      </template>
    </TitledContainer>

    <TitledContainer
      title="Hệ thống cửa hàng"
      linkTo="/aboutUs"
      :items="latestStores"
    >
      <template #default="{ items }">
        <template v-if="items && items.length > 0">
          <StoreCard
            v-for="s in items"
            :key="s.id"
            :store="s"
            class="min-w-[280px] md:min-w-[320px] snap-center"
          />
        </template>

        <div v-else class="w-full">
          <CustomerEmptyState
            type="search"
            title="Hệ thống cửa hàng"
            message="Chúng tôi đang mở rộng chi nhánh gần bạn."
          />
        </div>
      </template>
    </TitledContainer>
  </main>
</template>
