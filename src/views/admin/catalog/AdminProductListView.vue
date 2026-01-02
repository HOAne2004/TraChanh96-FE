<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product'
import { formatPrice } from '@/utils/formatters'
import { formatDate } from '@/utils/formatters'

import AdminDataContainer from '@/components/admin/ui/AdminDataContainer.vue'
import AdminDataTable from '@/components/admin/ui/AdminDataTable.vue'
import AdminActionHeader from '@/components/admin/ui/AdminActionHeader.vue'
import ProductFormModal from '@/components/admin/products/ProductFormModal.vue' // Modal tạo/sửa

const productStore = useProductStore()
const { products, productLoading: isLoading } = storeToRefs(productStore)

const searchQuery = ref('')
const isModalOpen = ref(false)
const editingProduct = ref(null)

// 1. Định nghĩa cấu hình cột
const productColumns = ref([
  { key: 'imageUrl', label: 'Ảnh', isImage: true },
  { key: 'name', label: 'Tên SP', sortable: true },
  { key: 'basePrice', label: 'Giá gốc', isCurrency: true, sortable: true },
  // Cần mapping ở Service/DTO để lấy CategoryName
  { key: 'categoryName', label: 'Danh mục', sortable: false },
  { key: 'productType', label: 'Loại', sortable: false },
  { key: 'createdAt', label: 'Ngày tạo', sortable: true },
])

// 2. Xử lý sự kiện
const handleEdit = (product) => {
  editingProduct.value = product
  isModalOpen.value = true
}

const handleDelete = async (product) => {
  if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
    // Gọi action DELETE (giả định đã có trong store)
    await productStore.deleteProductAction(product.id)
  }
}
const handleCreateNew = () => {
  editingProduct.value = null
  isModalOpen.value = true
}

// 3. Tải dữ liệu
onMounted(() => {
  productStore.fetchProduct() // Gọi hàm fetchAllProductData đã đổi tên
})

// 💡 Logic tìm kiếm: Gọi API mới với tham số q
watch(searchQuery, (newQuery) => {
  // Tải lại sản phẩm với bộ lọc tìm kiếm
  productStore.fetchProduct({ q: newQuery })
})
</script>

<template>
  <main class="p-6">
    <h1 class="text-3xl font-bold mb-6">Quản lý Sản phẩm & Topping</h1>

    <AdminActionHeader
      v-model="searchQuery"
      addButtonLabel="Thêm Sản phẩm mới"
      @add-new="handleCreateNew"
    />
    <AdminDataContainer
      :items="products"
      :loading="isLoading"
      :search-query="searchQuery"
      data-type="danh mục"
    >
      <template #empty-state>
        <div class="flex flex-col items-center justify-center p-6">
          <p class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Chưa có danh mục nào được tạo.
          </p>
          <button
            @click="handleCreateNew"
            class="text-green-600 hover:text-green-800 font-medium underline cursor-pointer transition-colors"
          >
            Bấm vào đây để tạo danh mục đầu tiên
          </button>
        </div>
      </template>

      <AdminDataTable
        :items="products"
        :columns="productColumns"
        :loading="productLoading"
        :actions="['edit', 'delete']"
        @edit-row="handleEdit"
        @delete-row="handleDelete"
      >
        <template #cell-basePrice="{ value }">
          {{ formatPrice(value) }}
        </template>

        <template #cell-createdAt="{ value }">
          {{ formatDate(value) }}
        </template>
      </AdminDataTable>
    </AdminDataContainer>
  </main>

  <ProductFormModal
    v-if="isModalOpen"
    :product="editingProduct"
    :is-open="isModalOpen"
    @close="isModalOpen = false"
  />
</template>
