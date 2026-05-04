<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/system/modal.store'
import { useAddressStore } from '@/stores/identity/address.store'
import { calculateDistance, formatDistance } from '@/utils/distance'
import { useToastStore } from '@/stores/system/toast.store'
import AddressFormModal from '@/components/customer/users/AddressFormModal.vue'

// 🟢 1. KHAI BÁO PROPS & EMIT TƯỜNG MINH
const props = defineProps({
  modelValue: { type: Number, default: null }, // ID địa chỉ đang chọn
  store: { type: Object, default: null }, // Thông tin cửa hàng
  isLoggedIn: Boolean,
  mode: { type: String, default: 'checkout' }, // 'checkout' hoặc 'profile'
})

const emit = defineEmits(['update:modelValue', 'set-default', 'delete'])

const addressStore = useAddressStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { addresses } = storeToRefs(addressStore)

const showModal = ref(false)
const isEditMode = ref(false)
const editData = ref(null)

// Mở modal để THÊM
const openAddModal = () => {
  isEditMode.value = false
  editData.value = null
  showModal.value = true
}

// Mở modal để SỬA
const openEditModal = (addr) => {
  isEditMode.value = true
  editData.value = addr
  showModal.value = true
}

const loadAddressesIfNeeded = async () => {
  if (props.isLoggedIn && (!addresses.value || addresses.value.length === 0)) {
    await addressStore.fetchAddresses()
  }
}

// Load địa chỉ nếu chưa có
onMounted(loadAddressesIfNeeded)

watch(() => props.isLoggedIn, (newVal) => {
  if (newVal) loadAddressesIfNeeded()
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
  if (props.mode === 'profile') return // Không có thao tác chọn khi đang ở trang profile

  const meta = getAddressMeta(addr)

  if (!meta.valid) {
    modalStore.show(`Địa chỉ quá xa (${meta.text}). Vui lòng chọn địa chỉ khác.`, 'warning')
    return
  }

  // Emit sự kiện ngay lập tức để cha (CheckoutView) cập nhật
  emit('update:modelValue', addr.id)
}

// Xử lý Submit chung (API tự rẽ nhánh)
const handleAddressSubmit = async (formData) => {
  try {
    const payload = {
      ...formData,
      fullAddress: `${formData.addressDetail}, ${formData.commune}, ${formData.district}, ${formData.province}`,
      latitude: formData.latitude || 21.0285,
      longitude: formData.longitude || 105.8542,
    }

    if (isEditMode.value) {
      await addressStore.updateAddress(editData.value.id, payload)
      toastStore.show({ message: 'Cập nhật địa chỉ thành công', type: 'success' })
    } else {
      const newAddr = await addressStore.createAddress(payload)
      toastStore.show({ message: 'Thêm địa chỉ thành công', type: 'success' })
      emit('update:modelValue', newAddr.id)
    }

    showModal.value = false
    await addressStore.fetchAddresses() // Tải lại danh sách
  } catch (e) {
    toastStore.show({
      message: isEditMode.value ? 'Lỗi cập nhật địa chỉ' : 'Lỗi thêm địa chỉ',
      type: 'error'
    })
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div
      class="text-xl flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
    >
      <h2
        class="font-bold text-gray-800 dark:text-white flex items-center gap-2 border-l-4 border-green-500 pl-2"
      >
        {{ mode === 'profile' ? 'Danh sách địa chỉ' : 'Địa chỉ nhận hàng' }}
      </h2>
      <button
        @click="openAddModal"
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
          // Style active (chỉ áp dụng cho checkout)
          mode === 'checkout' && modelValue === addr.id
            ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
            : 'border-gray-200 hover:border-green-300',

          // Style disable (chỉ check khoảng cách khi ở checkout)
          mode === 'checkout' && !getAddressMeta(addr).valid
            ? 'opacity-60 bg-gray-100 cursor-not-allowed'
            : 'cursor-pointer',
        ]"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1" @click="mode === 'profile' ? openEditModal(addr) : null">
            <p class="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-green-600 transition-colors">
              {{ addr.recipientName }} - {{ addr.recipientPhone }}
              <span
                v-if="addr.isDefault"
                class="text-[10px] bg-red-100 text-red-600 px-2 rounded border border-red-200 ml-2"
                >MẶC ĐỊNH</span
              >
            </p>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ addr.fullAddress }}</p>

            <div v-if="props.store && mode === 'checkout'" class="mt-2 flex items-center gap-2 text-xs">
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

            <div v-if="mode === 'profile'" class="mt-3 flex items-center gap-3">
              <button
                v-if="!addr.isDefault"
                @click.stop="$emit('set-default', addr.id)"
                class="text-xs font-semibold text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-200 bg-white hover:bg-green-50 py-1 px-2 rounded transition-all"
              >
                Đặt mặc định
              </button>

              <div class="flex-1"></div> <!-- Spacer to push delete button to right -->

              <button
                @click.stop="$emit('delete', addr.id)"
                class="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                title="Xóa địa chỉ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="mode === 'checkout' && modelValue === addr.id" class="text-green-600">
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

    <AddressFormModal
    :show="showModal"
    :is-edit="isEditMode"
    :initial-data="editData"
    @close="showModal = false"
    @submit="handleAddressSubmit"
  />
  </div>
</template>
