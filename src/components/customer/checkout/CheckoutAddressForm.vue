<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAddressStore } from '@/stores/address'
import { useModalStore } from '@/stores/modal'
import AddressFormModal from '@/components/common/AddressFormModal.vue'

// v-model là Address ID (để binding 2 chiều với cha - CheckoutView)
const selectedAddressId = defineModel()

const props = defineProps({
  isLoggedIn: Boolean
})

const addressStore = useAddressStore()
const modalStore = useModalStore()
const { addresses, loading } = storeToRefs(addressStore)

// State quản lý Modal
const showModal = ref(false)
const isSubmitting = ref(false)

// Load danh sách địa chỉ khi vào component
onMounted(() => {
  if (props.isLoggedIn) {
    addressStore.fetchAddresses()
  }
})

// Xử lý khi người dùng submit form từ Modal
const handleModalSubmit = async (formData) => {
  isSubmitting.value = true
  try {
    // 1. Chuẩn hóa dữ liệu cho Backend (DTO)
    // FullAddress dùng để hiển thị nhanh
    const fullAddressStr = `${formData.street}, ${formData.ward}, ${formData.district}, ${formData.city}`

    const payload = {
      RecipientName: formData.recipientName,
      RecipientPhone: formData.recipientPhone,
      AddressDetail: formData.street,
      Province: formData.city,
      District: formData.district,
      Commune: formData.ward,
      FullAddress: fullAddressStr,
      IsDefault: formData.isDefault,

      // Gửi tọa độ (nếu user không dùng định vị thì gửi fallback hoặc null tùy cấu hình BE)
      // Ở đây dùng fallback trung tâm Hà Nội nếu null để tránh lỗi Required ở BE cũ
      Latitude: formData.latitude || 21.0285,
      Longitude: formData.longitude || 105.8542
    }

    // 2. Gọi API tạo mới
    const addedAddress = await addressStore.createAddress(payload)

    modalStore.showToast('Thêm địa chỉ thành công!', 'success')

    // 3. Tự động chọn địa chỉ vừa thêm
    selectedAddressId.value = addedAddress.id

    // 4. Đóng modal
    showModal.value = false

  } catch (err) {
    console.error('Lỗi thêm địa chỉ:', err)
    let msg = 'Không thể thêm địa chỉ.'
    if (err.response?.data?.errors) {
       const firstKey = Object.keys(err.response.data.errors)[0]
       msg = err.response.data.errors[firstKey][0]
    } else if (err.response?.data?.message) {
       msg = err.response.data.message
    }
    modalStore.showToast(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const selectAddress = (id) => {
  selectedAddressId.value = id
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <h2 class="text-xl font-semibold border-l-4 border-green-500 pl-2 text-gray-800 dark:text-white">
        Địa chỉ nhận hàng
      </h2>

      <button
        v-if="isLoggedIn"
        @click="showModal = true"
        class="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors px-3 py-1.5 hover:bg-green-50 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm địa chỉ mới
      </button>
    </div>

    <div v-if="!isLoggedIn" class="text-amber-600 bg-amber-50 p-4 rounded-lg text-sm mb-3 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Vui lòng <router-link to="/login" class="underline font-bold hover:text-amber-800">đăng nhập</router-link> để chọn địa chỉ giao hàng.</span>
    </div>

    <div v-else-if="loading && addresses.length === 0" class="py-8 text-center text-gray-500">
      <div class="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
      Đang tải danh sách địa chỉ...
    </div>

    <div v-else-if="addresses.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
      <p class="text-gray-500 mb-4">Bạn chưa lưu địa chỉ nào.</p>
      <button
        @click="showModal = true"
        class="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-all"
      >
        + Thêm địa chỉ mới ngay
      </button>
    </div>

    <div v-else class="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        @click="selectAddress(addr.id)"
        class="group relative flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200"
        :class="
          selectedAddressId === addr.id
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500'
            : 'border-gray-200 hover:border-green-400 dark:border-gray-700 dark:hover:border-gray-500 hover:shadow-md'
        "
      >
        <div class="flex items-center h-5 mt-0.5">
          <div class="w-5 h-5 rounded-full border flex items-center justify-center"
               :class="selectedAddressId === addr.id ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'">
             <div v-if="selectedAddressId === addr.id" class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>

        <div class="ml-3 text-sm w-full">
          <div class="flex justify-between items-start">
            <p class="font-bold text-gray-800 dark:text-white text-base">
              {{ addr.recipientName }}
              <span class="font-normal text-gray-400 mx-2 text-xs">|</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ addr.recipientPhone }}</span>
            </p>
            <span v-if="addr.isDefault" class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-red-100">
              Mặc định
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {{ addr.fullAddress || `${addr.addressDetail}, ${addr.commune}, ${addr.district}, ${addr.province}` }}
          </p>
        </div>
      </div>
    </div>

    <AddressFormModal
      :show="showModal"
      :is-edit="false"
      @close="showModal = false"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
