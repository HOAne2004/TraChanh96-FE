<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { useAddressStore } from '@/stores/address'
import { calculateDistance, formatDistance } from '@/utils/distance'
import AddressFormModal from '@/components/common/AddressFormModal.vue'

// 🟢 1. KHAI BÁO PROPS & EMIT TƯỜNG MINH
const props = defineProps({
  modelValue: { type: Number, default: null }, // ID địa chỉ đang chọn
  store: { type: Object, default: null }, // Thông tin cửa hàng
  isLoggedIn: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const addressStore = useAddressStore()
const modalStore = useModalStore()
const { addresses } = storeToRefs(addressStore)

const showModal = ref(false)

// Load địa chỉ nếu chưa có
onMounted(async () => {
  if (props.isLoggedIn && (!addresses.value || addresses.value.length === 0)) {
    await addressStore.fetchAddresses()
  }
})

// 🟢 2. LOGIC TÍNH KHOẢNG CÁCH (AN TOÀN)
const getAddressMeta = (addr) => {
  // Nếu chưa có store hoặc địa chỉ thiếu tọa độ -> Coi như hợp lệ để hiển thị
  if (!props.store?.latitude || !addr.latitude) {
    return { distance: 0, text: '', valid: true, message: '' }
  }

  // Ép kiểu sang Number để tránh lỗi NaN nếu API trả về String
  const storeLat = Number(props.store.latitude)
  const storeLng = Number(props.store.longitude)
  const addrLat = Number(addr.latitude)
  const addrLng = Number(addr.longitude)

  const dist = calculateDistance(storeLat, storeLng, addrLat, addrLng)
  const maxRadius = props.store.deliveryRadius || 20
  const isValid = dist <= maxRadius

  return {
    distance: dist,
    text: formatDistance(dist),
    valid: isValid,
    message: isValid ? '' : `Quá xa (>${maxRadius}km)`,
  }
}

// 🟢 3. XỬ LÝ CLICK CHỌN
const handleSelectAddress = (addr) => {
  const meta = getAddressMeta(addr)

  if (!meta.valid) {
    modalStore.showToast(`Địa chỉ quá xa (${meta.text}). Vui lòng chọn địa chỉ khác.`, 'warning')
    return
  }

  // Emit sự kiện ngay lập tức để cha (CheckoutView) cập nhật
  emit('update:modelValue', addr.id)
}

const handleAddressSubmit = async (formData) => {
  try {
    const newAddr = await addressStore.createAddress({
      ...formData,
      FullAddress: `${formData.addressDetail}, ${formData.commune}, ${formData.district}, ${formData.province}`,
      Latitude: formData.latitude || 21.0285,
      Longitude: formData.longitude || 105.8542,
    })
    modalStore.showToast('Thêm địa chỉ thành công', 'success')

    // Auto select địa chỉ mới
    emit('update:modelValue', newAddr.id)
    showModal.value = false
  } catch (e) {
    modalStore.showToast('Lỗi thêm địa chỉ', 'error')
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="text-xl flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
      <h2 class="font-bold text-gray-800 dark:text-white flex items-center gap-2 border-l-4 border-green-500 pl-2">
         Địa chỉ nhận hàng
      </h2>
      <button
        @click="showModal = true"
        class="text-sm font-bold text-green-600 hover:text-green-700"
      >
        + Thêm mới
      </button>
    </div>

    <div
      v-if="addresses && addresses.length > 0"
      class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
    >
      <div
        v-for="addr in addresses"
        :key="addr.id"
        @click="handleSelectAddress(addr)"
        class="p-4 border rounded-xl transition-all relative group"
        :class="[
          // Style active
          modelValue === addr.id
            ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
            : 'border-gray-200 hover:border-green-300',

          // Style disable
          !getAddressMeta(addr).valid
            ? 'opacity-60 bg-gray-100 cursor-not-allowed'
            : 'cursor-pointer',
        ]"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-bold text-sm text-gray-800 dark:text-gray-200">
              {{ addr.recipientName }} - {{ addr.recipientPhone }}
              <span
                v-if="addr.isDefault"
                class="text-[10px] bg-red-100 text-red-600 px-2 rounded border border-red-200 ml-2"
                >MẶC ĐỊNH</span
              >
            </p>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ addr.fullAddress }}</p>

            <div v-if="props.store" class="mt-2 flex items-center gap-2 text-xs">
              <span
                v-if="getAddressMeta(addr).valid && getAddressMeta(addr).distance > 0"
                class="text-green-600 bg-green-50 px-2 py-0.5 rounded font-medium"
              >
                Cách {{ getAddressMeta(addr).text }}
              </span>
              <span
                v-if="!getAddressMeta(addr).valid"
                class="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold flex items-center gap-1"
              >
                🚫 {{ getAddressMeta(addr).message }}
              </span>
            </div>
          </div>

          <div v-if="modelValue === addr.id" class="text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6 border border-dashed rounded-xl bg-gray-50">
      <p class="text-gray-500 text-sm mb-2">Chưa có địa chỉ nào.</p>
      <button @click="showModal = true" class="text-green-600 font-bold text-sm">Thêm ngay</button>
    </div>

    <AddressFormModal :show="showModal" @close="showModal = false" @submit="handleAddressSubmit" />
  </div>
</template>
