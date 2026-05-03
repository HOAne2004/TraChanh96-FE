<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { useBrandStore } from '@/stores/catalog/brand.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useUploadStore } from '@/stores/system/upload.store'
import addressService from '@/services/identity/address.service.js'
import { getStoreStatusOptions } from '@/constants/store.constant'

// Components
import AdminStoreForm from '@/components/admin/store-operations/AdminStoreForm.vue'
import StorePreviewPanel from '@/components/admin/store-operations/AdminStorePreview.vue'
import AddressFormModal from '@/components/customer/users/AddressFormModal.vue'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()
const brandStore = useBrandStore()
const toast = useToastStore()
const uploadStore = useUploadStore()

const storeStatusOptions = getStoreStatusOptions()

// --- STATE ---
const isEditMode = computed(() => !!route.params.id)
const isLoading = ref(false)
const showAddressModal = ref(false)

// Form Data
const form = reactive({
  name: '',
  brandId: null,
  addressId: null,
  tempAddressId: null, // ID địa chỉ tạm (User Address) khi tạo mới Store
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

// --- COMPUTED ---
const addressInitialData = computed(() => ({
  recipientName: form.name,
  recipientPhone: form.phoneNumber,
}))

const previewData = computed(() => ({
  id: isEditMode.value ? route.params.id : 0,
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

// Computed helper để check hiển thị. Dùng addressDisplay để UI hiển thị Text thay vì Button
const hasAddress = computed(() => !!form.addressDisplay)

// --- LIFECYCLE ---
onMounted(async () => {
  await brandStore.fetchPublicBrandInfo()
  if (brandStore.brand) form.brandId = brandStore.brand.id

  if (isEditMode.value) {
    await loadStoreDetail(route.params.id)
  }
})

// --- METHODS ---
async function loadStoreDetail(id) {
  isLoading.value = true
  try {
    // 🟢 Dùng Action ADMIN mới để tránh bị 404 (Nếu Store bị Inactive/Closed)
    const store = await storeStore.fetchAdminStoreById(id)
    if (!store) {
      toast.show({ type: 'error', message: 'Không tìm thấy cửa hàng' })
      router.push({ name: 'admin.stores' })
      return
    }

    form.name = store.name
    form.brandId = store.brandId
    // Fallback ID nếu store.addressId chưa map ở action
    form.addressId = store.addressId || store.address?.id
    if (store.address) {
      if (typeof store.address === 'string') {
        // Data format from fetchStoreById (Flattened)
        form.addressDisplay = store.address
        form.latitude = store.latitude || 0
        form.longitude = store.longitude || 0
      } else {
        // Data format from cache or raw object
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
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function updateFormField(key, value) {
  form[key] = value
}

function handleOpenAddressModal() {
  if (!form.name || !form.name.trim()) {
    toast.show({
      type: 'warning',
      message: 'Vui lòng nhập tên cửa hàng trước khi tạo địa chỉ',
    })
    return
  }
  showAddressModal.value = true
}

async function handleAddressSubmit(data) {
  isLoading.value = true
  showAddressModal.value = false

  try {
    const fullAddr = [data.addressDetail, data.commune, data.district, data.province]
      .filter(Boolean)
      .join(', ')

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

    if (isEditMode.value) {
      const storeId = Number(route.params.id)
      const storePayload = { ...basePayload, storeId: storeId }

      if (form.addressId) {
        resultAddress = await addressService.updateForStore(form.addressId, storePayload)
      } else {
        resultAddress = await addressService.createForStore(storePayload)
      }
    } else {
      // Khi tạo mới store -> Tạo address user tạm
      console.log('Creating temp address...', basePayload)
      resultAddress = await addressService.create(basePayload)
    }

    // Cập nhật form state
    form.tempAddressId = resultAddress.id
    // 🟢 Cập nhật luôn form.addressId để đảm bảo logic submit
    form.addressId = resultAddress.id
    form.addressDisplay = resultAddress.fullAddress
    form.latitude = resultAddress.latitude
    form.longitude = resultAddress.longitude

    if (!form.phoneNumber && data.recipientPhone) {
      form.phoneNumber = data.recipientPhone
    }

    toast.show({ type: 'success', message: 'Đã liên kết địa chỉ thành công!' })
  } catch (error) {
    console.error(error)
    toast.show({
      type: 'error',
      message: 'Lỗi lưu địa chỉ: ' + (error.response?.data?.message || error.message),
    })
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
  console.log('Submitting payload check:', {
    addressId: form.addressId,
    tempId: form.tempAddressId,
  })

  // Chỉ chặn nếu KHÔNG CÓ CẢ 2 (cũ và mới)
  if (!form.name || (!form.addressId && !form.tempAddressId)) {
    toast.show({ type: 'error', message: 'Vui lòng nhập tên và tạo địa chỉ cho cửa hàng' })
    return
  }

  const payload = {
    ...form,
    // Ưu tiên temp ID nếu có (khi tạo mới), nếu không dùng ID cũ
    addressId: form.tempAddressId || form.addressId,
    openTime: form.openTime + ':00',
    closeTime: form.closeTime + ':00',
    openDate: form.openDate ? new Date(form.openDate).toISOString() : null,
  }

  // 🔴 VALIDATE CHẶT: addressId không được null
  if (!payload.addressId) {
    toast.show({
      type: 'error',
      message: 'Lỗi: Không tìm thấy ID địa chỉ. Vui lòng tạo lại địa chỉ.',
    })
    console.error('Missing addressId in payload:', payload)
    return
  }

  isLoading.value = true
  try {
    if (isEditMode.value) {
      await storeStore.updateStore(route.params.id, payload)
      toast.show({ type: 'success', message: 'Cập nhật thành công' })
    } else {
      console.log('Final payload before create:', payload)
      await storeStore.createStore(payload)
      toast.show({ type: 'success', message: 'Tạo mới thành công' })
      router.push({ name: 'admin.stores' })
    }
  } catch (error) {
    toast.show({
      type: 'error',
      message: 'Có lỗi xảy ra: ' + (error.response?.data?.message || error.message),
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Form Panel -->
    <div
      class="w-full xl:w-[45%] h-full flex flex-col bg-white border-r border-gray-200 shadow-xl z-10"
    >
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
        @back="router.back()"
      />
    </div>

    <!-- Preview Panel -->
    <StorePreviewPanel :preview-data="previewData" :form="form" />

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
