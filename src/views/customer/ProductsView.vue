<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/catalog/product.store'
import { useStoreStore } from '@/stores/store-operations/store.store'

import StoreFilter from '@/components/customer/store-operations/StoreFilter.vue'
import ProductCatalog from '@/components/customer/catalog/ProductCatalog.vue'

const productStore = useProductStore()
const storeStore = useStoreStore()

const { products, categories, loading: productLoading } = storeToRefs(productStore)
const { stores, selectedStoreId, storeMenu } = storeToRefs(storeStore)

const isInitialLoad = ref(true)
const isMenuLoading = ref(false)

watch(selectedStoreId, async (newId) => {
  if (newId) {
    isMenuLoading.value = true
    try {
      await storeStore.fetchStoreMenu(newId)
    } finally {
      isMenuLoading.value = false
    }
  } else {
    // Nếu bỏ chọn quán -> Reset menu để dùng list gốc
    storeStore.storeMenu = []
  }
})

// Hàm load dữ liệu
const loadData = async () => {
  try {
    await Promise.all([
      productStore.fetchProducts({ pageSize: 1000 }),
      storeStore.fetchActiveStores(),
    ])

    if (selectedStoreId.value) {
      await storeStore.fetchStoreMenu(selectedStoreId.value)
    }
  } catch (err) {
    console.error('Lỗi tải trang sản phẩm:', err)
  } finally {
    isInitialLoad.value = false
  }
}

onMounted(() => {
  loadData()
})

const currentProducts = computed(() => {
  // CASE 1: Đang chọn Store -> Dùng storeMenu (Để có giá & status đúng của quán)
  if (selectedStoreId.value && storeMenu.value.length > 0) {
    return storeMenu.value.map((p) => ({
      ...p,
      id: p.id || p.productId, // Map ID cho khớp ProductCard
      basePrice: p.displayPrice || p.basePrice, // Map giá bán tại quán
    }))
  }
  // CASE 2: Không chọn Store (hoặc đang load) -> Dùng list gốc của Brand
  return products.value || []
})

// Kiểm tra xem có đang loading không (kết hợp store loading và lần load đầu)
const isLoading = computed(() => productLoading.value && isInitialLoad.value)
</script>

<template>
  <main class="container mx-auto px-4 py-6 min-h-screen">
    <ProductCatalog
      :products="currentProducts"
      :categories="categories"
      :is-loading="isLoading"
    >
      <template #sidebar-top>
        <StoreFilter :stores="stores" v-model="selectedStoreId" />
      </template>
    </ProductCatalog>
  </main>
</template>
