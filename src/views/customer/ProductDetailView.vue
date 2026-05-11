<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Stores
import { useProductStore } from '@/stores/catalog/product.store'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { useUserStore } from '@/stores/identity/user.store'
import { usePolicyStore } from '@/stores/system/policy.store'
import { useSizeStore } from '@/stores/catalog/size.store'
import { useReviewStore } from '@/stores/catalog/review.store'

// Components
import NavLink from '@/components/ui/NavLink.vue'
import TitledContainer from '@/components/ui/TitledContainer.vue'
import DeliveryInfor from '@/components/customer/users/DeliveryInfor.vue'
import ReviewList from '@/components/customer/catalog/ReviewList.vue'
import Button from '@/components/ui/AppButton.vue'

// Refactored Components
import ProductGallery from '@/components/customer/catalog/ProductGallery.vue'
import ProductCustomizer from '@/components/customer/catalog/ProductCustomizer.vue'

const route = useRoute()
const router = useRouter()

const productStore = useProductStore()
const userStore = useUserStore()
const policyStore = usePolicyStore()
const storeStore = useStoreStore()
const sizeStore = useSizeStore()
const reviewStore = useReviewStore()

const { currentProduct, loading } = storeToRefs(productStore)
const { policy } = storeToRefs(policyStore)
const { canReview } = storeToRefs(reviewStore)
const { stores, selectedStoreId } = storeToRefs(storeStore)

const storeStatus = computed(() => {
  if (!selectedStoreId.value) return { isOpen: true }
  const store = stores.value.find((s) => s.id === selectedStoreId.value)
  return storeStore.getStoreStatus(store)
})

const loadData = async () => {
  await Promise.all([
    productStore.fetchProductBySlug(route.params.slug),
    storeStore.fetchActiveStores(),
    productStore.fetchProducts(),
    sizeStore.fetchActiveSizes(),
  ])

  if (currentProduct.value) {
    if (selectedStoreId.value) {
      await storeStore.fetchStoreMenu(selectedStoreId.value)
    }

    await reviewStore.fetchReviews(currentProduct.value.id)
    if (userStore.isLoggedIn) {
      await reviewStore.checkUserEligibility(currentProduct.value.id)
    }
  }
}

onMounted(loadData)
watch(() => route.params.slug, loadData)

watch(selectedStoreId, async (newId) => {
  if (newId) await storeStore.fetchStoreMenu(newId)
})

const handleBuyNow = ({ storeId }) => {
  router.push({ path: '/checkout', query: { storeId } })
}
</script>

<template>
  <main class="container mx-auto px-4 min-h-screen">
    <div
      v-if="selectedStoreId && !storeStatus.isOpen"
      class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <span class="font-bold">Cửa hàng hiện không nhận đơn.</span>
        <span class="ml-1">({{ storeStatus.message }})</span>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p>Đang tải chi tiết món...</p>
    </div>

    <div v-else-if="currentProduct" class="animate-fade-in">
      <div class="mb-6 text-sm text-gray-500 flex items-center gap-2">
        <NavLink to="/products" label="Sản phẩm" variant="secondary" />
        <span>/</span>
        <span class="font-semibold text-gray-800 dark:text-gray-200">{{
          currentProduct.name
        }}</span>
      </div>

      <div class="w-full grid grid-cols-1 md:grid-cols-[4fr_6fr] gap-10 lg:gap-16">
        <ProductGallery
          :product="currentProduct"
          :stores="stores"
          v-model:selectedStoreId="selectedStoreId"
        />
        <ProductCustomizer
          :product="currentProduct"
          @buy-now="handleBuyNow"
        />
      </div>

      <div class="mt-12">
        <TitledContainer v-if="currentProduct.description" title="Mô tả sản phẩm" controls="hidden">
          <div
            class="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
            v-html="currentProduct.description"
          ></div>
        </TitledContainer>

        <DeliveryInfor v-if="policy" :policy="policy" class="mt-8" />
      </div>

      <div
        v-if="canReview"
        class="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between"
      >
        <span class="text-green-800 text-sm font-medium">Bạn đã mua sản phẩm này?</span>
        <router-link to="/profile/orders" class="text-green-600 font-bold hover:underline text-sm"
          >Viết đánh giá trong Đơn hàng</router-link
        >
      </div>

      <div id="reviews-section" class="my-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TitledContainer
          v-if="currentProduct.ingredient"
          title="Thành phần"
          controls="hidden"
          class="lg:col-span-1"
        >
          <div
            class="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
            v-html="currentProduct.ingredient"
          ></div>
        </TitledContainer>
        <TitledContainer title="Đánh giá sản phẩm" controls="hidden" class="lg:col-span-2">
          <ReviewList :reviews="reviewStore.reviews" />
        </TitledContainer>
      </div>
    </div>

    <div v-else class="py-20 text-center">
      <h3 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
        Sản phẩm không tồn tại
      </h3>
      <Button label="Xem thực đơn" @click="router.push('/products')" />
    </div>
  </main>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
