<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { useAddressStore } from '@/stores/address'
import { useReviewStore } from '@/stores/review'
import { formatPrice, formatDate } from '@/utils/formatters'
import { getOrderStatusConfig } from '@/constants/order.constants'
import { getReviewStatusConfig } from '@/constants/review.constants'

import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'

const props = defineProps({
  userId: { type: Number, required: true },
  userPublicId: { type: String, required: true },
})

const activeTab = ref('orders')

const orderStore = useOrderStore()
const addressStore = useAddressStore()
const reviewStore = useReviewStore()

const { orders } = storeToRefs(orderStore)
const { addresses } = storeToRefs(addressStore)
const { adminReviews } = storeToRefs(reviewStore)

const loading = ref(false)

// Config cột cho Order
const orderColumns = [
  { key: 'orderCode', label: 'Mã đơn', class: 'font-bold text-blue-600' },
  { key: 'createdAt', label: 'Ngày đặt' },
  { key: 'grandTotal', label: 'Tổng tiền', class: 'text-right font-bold' },
  { key: 'status', label: 'Trạng thái', class: 'text-center' },
]

// Config cột cho Review
const reviewColumns = [
  { key: 'productName', label: 'Sản phẩm', class: 'max-w-[200px]' },
  { key: 'rating', label: 'Sao', class: 'text-center' },
  { key: 'content', label: 'Nội dung', class: 'max-w-[300px]' },
  { key: 'status', label: 'Trạng thái', class: 'text-center' },
  { key: 'createdAt', label: 'Ngày đăng', class: 'text-right' },
]

// --- FETCH DATA LOGIC ---
const loadTabContent = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'orders') {
      console.log('Đang gọi API với PublicId:', props.userPublicId)
      await orderStore.fetchOrders({
        userPublicId: props.userPublicId,
        pageIndex: 1,
        pageSize: 5,
      })
      console.log('Orders loaded:', orders.value)
    } else if (activeTab.value === 'addresses') {
      await addressStore.fetchAdminAddresses(props.userId)
    } else if (activeTab.value === 'reviews') {
      await reviewStore.fetchAdminReviews({
        userPublicId: props.userPublicId,
        pageIndex: 1,
        pageSize: 10,
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Watch activeTab change
watch(
  () => [props.userPublicId, activeTab.value],
  () => {
    loadTabContent()
  },
)

// Load default tab
onMounted(() => {
  loadTabContent()
})
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col relative"
  >
    <div class="border-b px-6 py-3">
      <nav class="flex gap-6">
        <button
          @click="activeTab = 'orders'"
          :class="[
            'text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-colors',
            activeTab === 'orders'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Lịch sử đơn hàng
        </button>
        <button
          @click="activeTab = 'addresses'"
          :class="[
            'text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-colors',
            activeTab === 'addresses'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Địa chỉ giao hàng
        </button>
        <button
          @click="activeTab = 'reviews'"
          :class="[
            'text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-colors',
            activeTab === 'reviews'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
        >
          Đánh giá
        </button>
      </nav>
    </div>

    <div
      v-if="loading"
      class="absolute inset-0 bg-white/80 z-20 flex justify-center items-center rounded-xl"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <div class="flex-1">
      <div v-if="activeTab === 'orders'">
        <AdminDataTable
          :items="orders"
          :columns="orderColumns"
          :pagination="null"
          empty-text="Khách hàng chưa có đơn hàng nào"
        >
          <template #cell-orderCode="{ item }"
            ><span>#{{ item.orderCode }}</span></template
          >
          <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
          <template #cell-grandTotal="{ value }">{{ formatPrice(value) }} đ</template>
          <template #cell-status="{ value }">
            <div class="flex justify-center">
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium border',
                  getOrderStatusConfig(value).color,
                ]"
              >
                {{ getOrderStatusConfig(value).label }}
              </span>
            </div>
          </template>
        </AdminDataTable>
      </div>

      <div v-else-if="activeTab === 'addresses'" class="p-6">
        <div v-if="addresses && addresses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="border rounded-lg p-4 relative hover:shadow-sm"
          >
            <div
              v-if="addr.isDefault"
              class="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded"
            >
              Mặc định
            </div>
            <div class="font-bold text-gray-900">{{ addr.recipientName }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ addr.recipientPhone }}</div>
            <div class="text-sm text-gray-700 mt-2">
              {{
                addr.fullAddress ||
                `${addr.detailAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`
              }}
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-400 italic py-10">
          Chưa có địa chỉ nào được lưu.
        </div>
      </div>

      <div v-else-if="activeTab === 'reviews'">
        <AdminDataTable
          :items="adminReviews"
          :columns="reviewColumns"
          :pagination="null"
          empty-text="Khách hàng chưa có đánh giá nào"
        >
          <template #cell-productName="{ item }"
            ><div class="line-clamp-1" :title="item.productName">
              {{ item.productName }}
            </div></template
          >
          <template #cell-rating="{ item }"
            ><span class="text-yellow-400">★ {{ item.rating }}</span></template
          >
          <template #cell-content="{ item }"
            ><p class="line-clamp-2 text-sm text-gray-600">{{ item.content }}</p></template
          >
          <template #cell-status="{ value }">
            <div class="flex justify-center">
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium border',
                  getReviewStatusConfig(value).color,
                ]"
              >
                {{ getReviewStatusConfig(value).label }}
              </span>
            </div>
          </template>
          <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
        </AdminDataTable>
      </div>
    </div>
  </div>
</template>
