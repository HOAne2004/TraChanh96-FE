<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'
import { useStoreStore } from '@/stores/store'

import ProductFilter from '@/components/customer/ProductFilter.vue'
import TitledContainer from '@/components/customer/TitledContainer.vue'
import ProductCard from '@/components/customer/card/ProductCard.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue'
import StoreFilter from '@/components/customer/StoreFilter.vue'

const productStore = useProductStore()
const storeStore = useStoreStore() // 3. Init

const { products, categories, loading: productLoading } = storeToRefs(productStore)
const { stores, selectedStoreId, storeMenu } = storeToRefs(storeStore) // 4. Lấy danh sách store

const selectedCategories = ref([])
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
      productStore.fetchProducts(),
      storeStore.fetchActiveStores(),
    ])

    // Nếu F5 trang mà đã có sẵn storeId trong localStorage/Pinia -> load menu luôn
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

// Xử lý khi người dùng tick chọn bộ lọc
const handleFilterChange = (ids) => {
  selectedCategories.value = ids.map((id) => String(id))
}

// ⭐ TÍNH TOÁN DATA HIỂN THỊ (Đã cập nhật logic Store)
const displayedSections = computed(() => {
  let sourceProducts = []

  // CASE 1: Đang chọn Store -> Dùng storeMenu (Để có giá & status đúng của quán)
  if (selectedStoreId.value && storeMenu.value.length > 0) {
    sourceProducts = storeMenu.value.map(p => ({
        ...p,
        id: p.id || p.productId, // Map ID cho khớp ProductCard
        basePrice: p.displayPrice || p.basePrice // Map giá bán tại quán
    }))
  }
  // CASE 2: Không chọn Store (hoặc đang load) -> Dùng list gốc của Brand
  else {
    sourceProducts = products.value || []
  }

  // --- Lọc theo Category ---
  let cats = categories.value || []
  if (selectedCategories.value.length > 0) {
    cats = cats.filter((c) => selectedCategories.value.includes(String(c.id)))
  }

  // --- Gom nhóm ---
  const sections = cats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: sourceProducts.filter((p) => String(p.categoryId) === String(cat.id)),
  }))

  return sections.filter((section) => section.items.length > 0)
})

// Kiểm tra xem có đang loading không (kết hợp store loading và lần load đầu)
const isLoading = computed(() => productLoading.value && isInitialLoad.value)


</script>

<template>
  <main class="container mx-auto px-4 py-6 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="hidden md:block md:col-span-4 lg:col-span-3">
        <div class="sticky top-20 space-y-6">
          <StoreFilter :stores="stores" v-model="selectedStoreId" />
          <ProductFilter
            :categories="categories"
            :model-value="selectedCategories"
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>

      <div class="col-span-1 md:col-span-8 lg:col-span-9">
        <div
          v-if="isLoading && productLoading"
          class="flex flex-col items-center justify-center py-20 text-gray-500"
        >
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>

        <div v-else>
          <div v-if="displayedSections.length > 0">
            <TitledContainer
              v-for="section in displayedSections"
              :key="section.id"
              :title="section.name"
              :items="section.items"
              layout="grid"
              :initialCount="8"
            >
              <template #default="{ items }">
                <ProductCard v-for="p in items" :key="p.id" :product="p" class="w-full h-full" />
              </template>
            </TitledContainer>
          </div>

          <div v-else class="py-10">
            <CustomerEmptyState
              type="default"
              title="Không tìm thấy sản phẩm nào"
              :message="
                selectedCategories.length > 0
                  ? 'Không có sản phẩm nào thuộc danh mục bạn chọn.'
                  : 'Danh sách sản phẩm đang được cập nhật.'
              "
              action-label="Xóa bộ lọc"
              @action-click="selectedCategories = []"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
