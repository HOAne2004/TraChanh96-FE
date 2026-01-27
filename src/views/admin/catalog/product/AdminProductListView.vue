<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

import defaultDrinkImage from '@/assets/images/others/default-drink.png'

import PageHeader from '@/components/admin/common/PageHeader.vue'
import AdminPagination from '@/components/admin/common/AdminPagination.vue'
import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

import { useProductStore } from '@/stores/product'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatters'
import { useModalStore } from '@/stores/modal'

const router = useRouter()
const productStore = useProductStore()
const toastStore = useToastStore()
const modalStore = useModalStore()

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  search: '',
  status: '',
})

async function fetchData() {
  await productStore.fetchProducts({
    search: queryParams.search,
    status: queryParams.status,
  })
}

onMounted(() => {
  fetchData()
  console.log('Pagination data:', productStore.pagination)
  console.log('Type:', typeof productStore.pagination)
})

function handlePageChange(page) {
  queryParams.page = page
}

function handleFilterChange(values) {
  queryParams.search = values.keyword
  queryParams.status = values.status
  queryParams.page = 1
  fetchData()
}
function handleCreate() {
  router.push({ name: 'admin-product-create' })
}

const columns = [
  {
    key: 'name',
    label: 'Tên sản phẩm',
    sortable: true,
  },
  {
    key: 'basePrice',
    label: 'Giá',
    sortable: true,
  },
  {
    key: 'totalSold',
    label: 'Đã bán',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Trạng thái',
    sortable: true,
  },
]

async function handleAction(type, item) {
  if (type == 'edit' || type == 'view')
    router.push({ name: 'admin-product-edit', params: { id: item.id } })
  if (type == 'delete') {
    const confirmed = await modalStore.confirmDelete()
    if (confirmed) {
      toastStore.show({
        type: 'success',
        message: 'Xóa sản phẩm thành công',
      })
    }
  }
}
</script>
<template>
  <PageHeader
    title="Sản phẩm"
    description="Xem, tạo, cập nhật sản phẩm"
    @create="handleCreate"
    @change="handleFilterChange"
  />

  <AdminDataTable
    :items="productStore.products"
    :columns="columns"
    :loading="productStore.loading"
    :actions="['edit', 'delete']"
    @action="handleAction"
  >
    <template #cell-name="{ item }">
      <div class="flex items-center gap-3">
        <div
          class="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            class="w-full h-full object-cover"
            alt="Product Image"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <img
              :src="defaultDrinkImage"
              class="w-full h-full object-cover"
              alt="Default Product Image"
            />
          </div>
        </div>
        <div>
          <div class="font-medium text-gray-900">{{ item.name }}</div>
          <div class="text-xs text-gray-500">{{ item.slug }}</div>
        </div>
      </div>
    </template>
    <template #cell-basePrice="{ item }">
      {{ formatPrice(item.basePrice) + ' đ' }}
    </template>
  </AdminDataTable>
  <AdminPagination
    v-if="productStore.pagination"
    :pagination="productStore.pagination"
    @page-change="handlePageChange"
  />
</template>
