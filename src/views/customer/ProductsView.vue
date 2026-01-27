<script setup>
import { ref, onMounted, computed } from 'vue'
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
const { stores, selectedStoreId } = storeToRefs(storeStore) // 4. Lấy danh sách store

const selectedCategories = ref([])
const isInitialLoad = ref(true)

// Hàm load dữ liệu
const loadData = async () => {
  try {
    await Promise.all([
      productStore.fetchProducts(),
      storeStore.fetchActiveStores(), // 6. Gọi API lấy store nếu chưa có
    ])
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
  // Chuyển hết về string để so sánh id an toàn
  selectedCategories.value = ids.map((id) => String(id))
}

// ⭐ TÍNH TOÁN DATA HIỂN THỊ (Đã cập nhật logic Store)
const displayedSections = computed(() => {
  let filteredProducts = products.value || []

  // A. Lọc theo Store (Nếu có chọn)
  // Lưu ý: Cần đảm bảo object Product có field storeId hoặc logic tương đương
  // Tạm thời giả định logic lọc đơn giản hoặc lọc client-side
  // [TEMPORARY FIX] Hiển thị tất cả sản phẩm cho mọi cửa hàng
  // vì Admin chưa có chức năng gán sản phẩm vào Store.
  if (selectedStoreId.value) {
    // filteredProducts = filteredProducts.filter((p) => p.storeIds.includes(selectedStoreId.value))
  }

  let cats = categories.value || []

  // B. Lọc theo Category
  if (selectedCategories.value.length > 0) {
    cats = cats.filter((c) => selectedCategories.value.includes(String(c.id)))
  }

  // C. Map cấu trúc
  const sections = cats.map((cat) => ({
    id: cat.id,
    name: cat.name,
    // Dùng danh sách đã lọc (filteredProducts) thay vì products gốc
    items: filteredProducts.filter((p) => String(p.categoryId) === String(cat.id)),
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
