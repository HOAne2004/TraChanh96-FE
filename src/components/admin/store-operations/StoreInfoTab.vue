<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { useBrandStore } from '@/stores/catalog/brand.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useUploadStore } from '@/stores/system/upload.store'
import addressService from '@/services/identity/address.service.js'
import { getStoreStatusOptions } from '@/constants/store.constant'

import AdminStoreForm from '@/components/admin/store-operations/AdminStoreForm.vue'
import StorePreviewPanel from '@/components/admin/store-operations/AdminStorePreview.vue'
import AddressFormModal from '@/components/customer/users/AddressFormModal.vue'

const props = defineProps({
  store: { type: Object, default: null }, // Null in create mode
  isEditMode: { type: Boolean, default: false }
})

const emit = defineEmits(['saved'])

const router = useRouter()
const storeStore = useStoreStore()
const brandStore = useBrandStore()
const toast = useToastStore()
const uploadStore = useUploadStore()

const storeStatusOptions = getStoreStatusOptions()

const isLoading = ref(false)
const showAddressModal = ref(false)

const form = reactive({
  name: '',
  brandId: null,
  addressId: null,
  tempAddressId: null,
  addressDisplay: '',
  latitude: 0,
  longitude: 0,
  imageUrl: '',
  description: '',
  phoneNumber: '',
  wifiPassword: '',
  openTime: '07:00',
  closeTime: '22:00',
  openDate: '',
  status: 'ComingSoon',
  shippingFeeFixed: 0,
  shippingFeePerKm: 5000,
  deliveryRadius: 20,
  mapVerified: false,
})

const addressInitialData = computed(() => ({
  recipientName: form.name,
  recipientPhone: form.phoneNumber,
}))

const previewData = computed(() => ({
  id: props.isEditMode ? props.store?.id : 0,
  name: form.name || 'Tên cửa hàng (Preview)',
  imageUrl: form.imageUrl || 'https://placehold.co/800x400?text=No+Image',
  description: form.description,
  brandId: form.brandId,
  brandName: brandStore.brand?.name || 'Thương hiệu',
  brand: brandStore.brand,
  address: {
    fullAddress: form.addressDisplay || 'Địa chỉ chưa cập nhật',
    latitude: form.latitude,
    longitude: form.longitude,
  },
  openTime: form.openTime + ':00',
  closeTime: form.closeTime + ':00',
  status: form.status,
  phoneNumber: form.phoneNumber,
  wifiPassword: form.wifiPassword,
  socialMedias: [],
}))

const hasAddress = computed(() => !!form.addressDisplay)

onMounted(async () => {
  await brandStore.fetchPublicBrandInfo()
  if (brandStore.brand && !props.isEditMode) form.brandId = brandStore.brand.id

  if (props.isEditMode && props.store) {
    populateForm(props.store)
  }
})

watch(() => props.store, (newStore) => {
  if (newStore && props.isEditMode) populateForm(newStore)
}, { deep: true })

function populateForm(store) {
  form.name = store.name
  form.brandId = store.brandId
  form.addressId = store.addressId || store.address?.id
  if (store.address) {
    if (typeof store.address === 'string') {
      form.addressDisplay = store.address
      form.latitude = store.latitude || 0
      form.longitude = store.longitude || 0
    } else {
      form.addressDisplay = store.address.fullAddress || store.address.addressDetail || ''
      form.latitude = store.address.latitude || 0
      form.longitude = store.address.longitude || 0
    }
  }

  form.imageUrl = store.imageUrl
  form.description = store.description || ''
  form.phoneNumber = store.phoneNumber || ''
  form.wifiPassword = store.wifiPassword || ''
  form.openTime = store.openTime ? store.openTime.slice(0, 5) : '07:00'
  form.closeTime = store.closeTime ? store.closeTime.slice(0, 5) : '22:00'
  form.openDate = store.openDate ? store.openDate.split('T')[0] : ''
  form.status = store.status
  form.shippingFeeFixed = store.shippingFeeFixed
  form.shippingFeePerKm = store.shippingFeePerKm
  form.deliveryRadius = store.deliveryRadius
}

function updateFormField(key, value) {
  form[key] = value
}

function handleOpenAddressModal() {
  if (!form.name || !form.name.trim()) {
    toast.show({ type: 'warning', message: 'Vui lòng nhập tên cửa hàng trước khi tạo địa chỉ' })
    return
  }
  showAddressModal.value = true
}

async function handleAddressSubmit(data) {
  isLoading.value = true
  showAddressModal.value = false

  try {
    const fullAddr = [data.addressDetail, data.commune, data.district, data.province].filter(Boolean).join(', ')

    const parseCoordinate = (val) => {
      const num = parseFloat(val)
      return isNaN(num) ? 0 : num
    }

    const basePayload = {
      fullAddress: fullAddr,
      addressDetail: data.addressDetail,
      province: data.province,
      district: data.district,
      commune: data.commune,
      latitude: parseCoordinate(data.latitude),
      longitude: parseCoordinate(data.longitude),
      recipientName: form.name.trim(),
      recipientPhone: form.phoneNumber || '0900000000',
      isDefault: false,
    }

    let resultAddress

    if (props.isEditMode) {
      const storeId = props.store.id
      const storePayload = { ...basePayload, storeId: storeId }

      if (form.addressId) {
        resultAddress = await addressService.updateForStore(form.addressId, storePayload)
      } else {
        resultAddress = await addressService.createForStore(storePayload)
      }
    } else {
      resultAddress = await addressService.create(basePayload)
    }

    form.tempAddressId = resultAddress.id
    form.addressId = resultAddress.id
    form.addressDisplay = resultAddress.fullAddress
    form.latitude = resultAddress.latitude
    form.longitude = resultAddress.longitude

    if (!form.phoneNumber && data.recipientPhone) {
      form.phoneNumber = data.recipientPhone
    }

    toast.show({ type: 'success', message: 'Đã liên kết địa chỉ thành công!' })
  } catch (error) {
    toast.show({ type: 'error', message: 'Lỗi lưu địa chỉ: ' + (error.response?.data?.message || error.message) })
  } finally {
    isLoading.value = false
  }
}

async function handleImageUpload(file) {
  try {
    const url = await uploadStore.uploadFileAction(file)
    form.imageUrl = url
    toast.show({ type: 'success', message: 'Tải ảnh thành công' })
  } catch (error) {
    toast.show({ type: 'error', message: 'Lỗi tải ảnh: ' + error.message })
  }
}

async function handleSubmit() {
  if (!form.name || (!form.addressId && !form.tempAddressId)) {
    toast.show({ type: 'error', message: 'Vui lòng nhập tên và tạo địa chỉ cho cửa hàng' })
    return
  }

  const payload = {
    ...form,
    addressId: form.tempAddressId || form.addressId,
    openTime: form.openTime + ':00',
    closeTime: form.closeTime + ':00',
    openDate: form.openDate ? new Date(form.openDate).toISOString() : null,
  }

  if (!payload.addressId) {
    toast.show({ type: 'error', message: 'Lỗi: Không tìm thấy ID địa chỉ.' })
    return
  }

  isLoading.value = true
  try {
    if (props.isEditMode) {
      await storeStore.updateStore(props.store.id, payload)
      toast.show({ type: 'success', message: 'Cập nhật thành công' })
      emit('saved') // Dùng để refresh lại chi tiết
    } else {
      const res = await storeStore.createStore(payload)
      toast.show({ type: 'success', message: 'Tạo mới thành công' })
      router.push({ name: 'admin.store.detail', params: { id: res.id || res.data?.id || 1 }, query: { tab: 'info' } })
    }
  } catch (error) {
    toast.show({ type: 'error', message: 'Có lỗi xảy ra: ' + (error.response?.data?.message || error.message) })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col xl:flex-row h-full rounded-2xl shadow-sm border border-gray-200 overflow-hidden bg-white min-h-[600px]">
    <!-- Form Panel -->
    <div class="w-full xl:w-[45%] flex flex-col bg-white border-r border-gray-200 h-[800px] overflow-y-auto">
      <AdminStoreForm
        :form="form"
        :is-loading="isLoading"
        :is-edit-mode="isEditMode"
        :store-status-options="storeStatusOptions"
        :has-address="hasAddress"
        :upload-loading="uploadStore.loading"
        @update:form="updateFormField"
        @image-upload="handleImageUpload"
        @address-modal="handleOpenAddressModal"
        @submit="handleSubmit"
        @back="router.push({ name: 'admin.stores' })"
      />
    </div>

    <!-- Preview Panel -->
    <div class="flex-1 bg-gray-50 h-[800px] overflow-y-auto relative">
      <StorePreviewPanel :preview-data="previewData" :form="form" />
    </div>

    <!-- Address Modal -->
    <AddressFormModal
      :show="showAddressModal"
      :initial-data="addressInitialData"
      :is-edit="false"
      :for-store="true"
      @close="showAddressModal = false"
      @submit="handleAddressSubmit"
    />
  </div>
</template>
