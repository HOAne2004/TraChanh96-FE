<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/productStore'

import ProductFilter from '@/components/customer/ProductFilter.vue'
import TitledContainer from '@/components/customer/TitledContainer.vue'
import ProductCard from '@/components/customer/card/ProductCard.vue'
import CustomerEmptyState from '@/components/common/CustomerEmptyState.vue' // Import Empty State

const store = useProductStore()
// Lấy thêm loading state từ store
const { products: productsRef, categories: categoriesRef, productLoading } = storeToRefs(store)

const selectedCategories = ref([])
const isLoadingLocal = ref(true)

// Sử dụng loading từ store hoặc local đều được
const isLoading = computed(() => productLoading.value || isLoadingLocal.value)

onMounted(async () => {
  try {
    await store.fetchProduct()
  } finally {
    isLoadingLocal.value = false
  }
})

// Unwrap dữ liệu
const categories = computed(() => categoriesRef.value || [])
const products = computed(() => productsRef.value || [])

const handleFilterChange = (ids) => {
  selectedCategories.value = ids.map((id) => String(id))
}

// Hàm lấy sản phẩm theo danh mục
const productsByCategory = (categoryId) =>
  products.value.filter((p) => String(p.categoryId) === String(categoryId))

// ⭐️ TÍNH TOÁN DANH SÁCH HIỂN THỊ (Logic gộp)
const displayedSections = computed(() => {
  let cats = categories.value

  // 1. Lọc danh mục nếu có chọn Filter
  if (selectedCategories.value.length > 0) {
    cats = cats.filter((c) => selectedCategories.value.includes(String(c.id)))
  }

  // 2. Map sang cấu trúc { category, items } và LỌC BỎ danh mục rỗng
  // (Giúp giao diện sạch sẽ, không hiện tiêu đề trống)
  return cats
    .map((cat) => ({
      ...cat,
      items: productsByCategory(cat.id),
    }))
    .filter((section) => section.items.length > 0)
})
</script>

<template>
  <main class="container mx-auto px-4 py-6 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="hidden md:block md:col-span-3 lg:col-span-2">
        <div class="sticky top-20">
          <ProductFilter :categories="categories" @update:selected="handleFilterChange" />
        </div>
      </div>

      <div class="col-span-1 md:col-span-9 lg:col-span-10">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-500">
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
              controls="hidden"
            >
              <template #default="{ items }">
                <ProductCard v-for="p in items" :key="p.id" :product="p" />
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
