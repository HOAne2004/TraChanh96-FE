<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import ProductFilter from '@/components/customer/catalog/ProductFilter.vue'
import TitledContainer from '@/components/ui/TitledContainer.vue'
import ProductCard from '@/components/customer/catalog/ProductCard.vue'
import CustomerEmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

// Quản lý State nội bộ: Lưu danh sách ID danh mục đang được chọn
const selectedCategories = ref([])

const handleFilterChange = (ids) => {
  selectedCategories.value = ids.map((id) => String(id))
}

// Logic gom nhóm sản phẩm theo Category và lọc
const displayedSections = computed(() => {
  let sourceProducts = props.products || []

  // --- Lọc theo Từ khóa tìm kiếm (từ URL query) ---
  const searchKeyword = (route.query.search || '').toString().toLowerCase().trim()
  if (searchKeyword) {
    sourceProducts = sourceProducts.filter((p) =>
      p.name?.toLowerCase().includes(searchKeyword)
    )
  }

  // --- Lọc theo Category ---
  let cats = props.categories || []
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
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
    <div class="hidden md:block md:col-span-4 lg:col-span-3">
      <div class="sticky top-20 space-y-6">
        <!-- Slot để chèn thêm các filter khác phía trên ProductFilter (VD: StoreFilter) -->
        <slot name="sidebar-top"></slot>

        <ProductFilter
          :categories="categories"
          :model-value="selectedCategories"
          @update:model-value="handleFilterChange"
        />
      </div>
    </div>

    <div class="col-span-1 md:col-span-8 lg:col-span-9">
      <div
        v-if="isLoading"
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
</template>
