<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBrandStore } from '@/stores/brand'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatters'
import NavLink from '@/components/common/NavLink.vue'

const route = useRoute()
const router = useRouter()
const brandStore = useBrandStore()
const toast = useToastStore()

const storeId = route.params.id
const storeName = route.state?.name
const products = ref([])
const loading = ref(false)
const processingId = ref(null)
const selectedAll = ref(false)
const bulkProcessing = ref(false)

// Load dữ liệu
const fetchStoreProducts = async () => {
  loading.value = true
  try {
    await brandStore.fetchStoreProducts(storeId)
    products.value = brandStore.storeProducts.map(p => ({
      ...p,
      selected: false // Thêm property selected
    }))
  } catch (err) {
    console.error(err)
    toast.show({ type: 'error', message: 'Lỗi tải danh sách sản phẩm' })
  } finally {
    loading.value = false
  }
}

// Click chọn row
const selectRow = (product) => {
  product.selected = !product.selected
  updateSelectAllState()
}

// Double click để toggle nhanh (tuỳ chọn)
const handleRowDoubleClick = (product) => {
  if (!bulkProcessing.value) {
    toggleProduct(product)
  }
}

// Cập nhật trạng thái "chọn tất cả"
const updateSelectAllState = () => {
  const selectedCount = selectedProducts.value.length
  if (selectedCount === 0) {
    selectedAll.value = false
  } else if (selectedCount === products.value.length) {
    selectedAll.value = true
  } else {
    selectedAll.value = false
  }
}

// Toggle chọn tất cả
const toggleSelectAll = () => {
  selectedAll.value = !selectedAll.value
  products.value.forEach(p => {
    p.selected = selectedAll.value
  })
}

// Lấy danh sách sản phẩm được chọn
const selectedProducts = computed(() => {
  return products.value.filter(p => p.selected)
})

// Xử lý Bật/Tắt từng sản phẩm
const toggleProduct = async (product) => {
  processingId.value = product.productId
  try {
    if (product.status === 'disabled') {
      await brandStore.disableProductAtStore(storeId, product.productId)
      product.status = 'disabled'
      toast.show({ type: 'success', message: `Đã ngừng bán: ${product.productName}` })
    } else {
      await brandStore.enableProductAtStore(storeId, product.productId)
      product.status = 'available'
      toast.show({ type: 'success', message: `Đã mở bán: ${product.productName}` })
    }
  } catch (err) {
    console.error(err)
    toast.show({ type: 'error', message: 'Không thể cập nhật trạng thái' })
  } finally {
    processingId.value = null
  }
}

// Xử lý hàng loạt: Bật tất cả
const enableAllSelected = async () => {
  if (selectedProducts.value.length === 0) return

  bulkProcessing.value = true
  try {
    const promises = selectedProducts.value.map(product =>
      brandStore.enableProductAtStore(storeId, product.productId)
    )
    await Promise.all(promises)

    // Cập nhật UI
    selectedProducts.value.forEach(p => {
      p.status = 'available'
      p.selected = false
    })

    toast.show({ type: 'success', message: `Đã mở bán ${selectedProducts.value.length} sản phẩm` })
    selectedAll.value = false
  } catch (err) {
    console.error(err)
    toast.show({ type: 'error', message: 'Có lỗi khi xử lý hàng loạt' })
  } finally {
    bulkProcessing.value = false
  }
}

// Xử lý hàng loạt: Tắt tất cả
const disableAllSelected = async () => {
  if (selectedProducts.value.length === 0) return

  bulkProcessing.value = true
  try {
    const promises = selectedProducts.value.map(product =>
      brandStore.disableProductAtStore(storeId, product.productId)
    )
    await Promise.all(promises)

    // Cập nhật UI
    selectedProducts.value.forEach(p => {
      p.status = 'disabled'
      p.selected = false
    })

    toast.show({ type: 'success', message: `Đã ngừng bán ${selectedProducts.value.length} sản phẩm` })
    selectedAll.value = false
  } catch (err) {
    console.error(err)
    toast.show({ type: 'error', message: 'Có lỗi khi xử lý hàng loạt' })
  } finally {
    bulkProcessing.value = false
  }
}

// Bỏ chọn tất cả
const clearSelection = () => {
  products.value.forEach(p => {
    p.selected = false
  })
  selectedAll.value = false
}

onMounted(() => {
  fetchStoreProducts()
})
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-1 ">
          <router-link :to="{ name: 'admin.stores' }" class="underline hover:text-green-600 ">Quản lý cửa hàng</router-link>
          <span>/</span>
          <span>Thực đơn cửa hàng {{ storeName }}</span>
        </div>
        <h1 class="text-2xl font-bold text-green-600 dark:text-green-500">Thực đơn cửa hàng</h1>
      </div>
      <button
        @click="fetchStoreProducts"
        class="p-2 text-gray-500 hover:text-green-600 transition-colors duration-100"
        title="Làm mới"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    </div>

    <!-- Toolbar chọn hàng loạt - Hiện khi có row được chọn -->
    <div v-if="products.length > 0 && selectedProducts.length > 0"
         class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between transition-all duration-200">
      <div class="flex items-center gap-3">
        <button
          @click="clearSelection"
          class="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-100"
          title="Bỏ chọn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <span class="text-sm font-medium text-green-700">
          Đã chọn {{ selectedProducts.length }} sản phẩm
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="enableAllSelected"
          :disabled="bulkProcessing"
          class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                 flex items-center gap-2"
        >
          <svg v-if="!bulkProcessing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span v-if="bulkProcessing" class="inline-flex items-center">
            <svg class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </span>
          <span v-else>Bật bán ({{ selectedProducts.length }})</span>
        </button>
        <button
          @click="disableAllSelected"
          :disabled="bulkProcessing"
          class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                 flex items-center gap-2"
        >
          <svg v-if="!bulkProcessing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Tắt bán ({{ selectedProducts.length }})</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-gray-500 border-b border-gray-100 text-sm uppercase tracking-wider">
            <!-- Header "Chọn tất cả" thay cho "Sản phẩm" -->
            <th
              @click="toggleSelectAll"
              :class="[
                'py-4 px-2 font-medium cursor-pointer select-none transition-colors duration-100',
                selectedAll ? 'text-green-600' : 'hover:text-green-600'
              ]"
              colspan="2"
            >
              <div class="flex items-center gap-2">
                <span class="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="none"
                    class="w-4 h-4"
                  >
                    <path
                      v-if="selectedAll"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                    <path
                      v-else-if="selectedProducts.length > 0 && selectedProducts.length < products.length"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 12h-15"
                    />
                    <rect
                      v-else
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="1"
                      stroke-width="1.5"
                    />
                  </svg>
                </span>
                <span>
                  {{ selectedAll ? 'BỎ CHỌN TẤT CẢ' : 'CHỌN TẤT CẢ' }}
                </span>
                <span v-if="selectedProducts.length > 0" class="text-xs font-normal">
                  ({{ selectedProducts.length }} đã chọn)
                </span>
              </div>
            </th>
            <th class="py-4 px-2 font-medium text-right">Giá gốc</th>
            <th class="py-4 px-2 font-medium text-center w-40">Trạng thái</th>
            <th class="py-4 px-2 font-medium text-center w-32">Thao tác</th>
          </tr>
        </thead>

        <tbody v-if="loading">
           <tr>
             <td colspan="5" class="py-10 text-center text-gray-500">
               <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
               Đang tải dữ liệu...
             </td>
           </tr>
        </tbody>

        <tbody v-else-if="products.length === 0">
           <tr>
             <td colspan="5" class="py-10 text-center text-gray-500">
               Chưa có sản phẩm nào trong hệ thống.
             </td>
           </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="p in products"
            :key="p.productId"
            @click="selectRow(p)"
            @dblclick="handleRowDoubleClick(p)"
            :class="[
              'group transition-all duration-100 border-b border-gray-50 last:border-0',
              'cursor-pointer select-none',
              p.selected
                ? 'bg-green-50 hover:bg-green-100'
                : 'hover:bg-gray-50',
              processingId === p.productId ? 'opacity-70' : ''
            ]"
          >
            <!-- Icon chọn thay vì checkbox -->
            <td class="py-3 px-2 w-10">
              <div class="flex items-center justify-center">
                <div
                  :class="[
                    'w-5 h-5 rounded border-2 transition-all duration-100 flex items-center justify-center',
                    p.selected
                      ? 'bg-green-600 border-green-600'
                      : 'bg-white border-gray-300'
                  ]"
                >
                  <svg
                    v-if="p.selected"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="w-3 h-3 text-white"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
              </div>
            </td>

            <td class="py-3 px-2 flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                <img :src="p.imageUrl || 'https://via.placeholder.com/50'" class="w-full h-full object-cover" />
              </div>
              <div>
                <span class="font-medium text-gray-800 block">{{ p.productName }}</span>
                <span class="text-xs text-gray-500">ID: {{ p.productId }}</span>
              </div>
            </td>

            <td class="py-3 px-2 text-right font-medium text-gray-600">
              {{ formatPrice(p.basePrice) }}
            </td>

            <td class="py-3 px-2 text-center">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold transition-colors duration-100"
                :class="p.status === 'available'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'"
              >
                {{ p.status === 'available' ? 'Đang bán' : 'Ngừng bán' }}
              </span>
            </td>

            <td class="py-3 px-2 text-center">
              <button
                @click.stop="toggleProduct(p)"
                :disabled="processingId === p.productId || bulkProcessing"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors
                       duration-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                       hover:scale-105 active:scale-95"
                :class="p.status === 'available' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 hover:bg-gray-400'"
              >
                <span class="sr-only">Toggle selling</span>
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-100"
                  :class="p.status === 'available' ? 'translate-x-6' : 'translate-x-1'"
                />
                <span v-if="processingId === p.productId" class="absolute inset-0 flex items-center justify-center">
                   <span class="fast-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
/* Custom fast ping animation */
.fast-ping {
  animation: fastPing 0.6s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes fastPing {
  75%, 100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* Smooth transitions */
* {
  transition-behavior: allow-discrete;
}

/* Selection styles */
tr {
  transition-property: background-color, transform;
}
</style>
