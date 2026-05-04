<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useToastStore } from '@/stores/system/toast.store'

/* =====================================================
 * PROPS / EMITS
 * ===================================================== */
const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  initialData: Object,
  forStore: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])
const toast = useToastStore()

/* =====================================================
 * FORM STATE (UI MODEL)
 * ===================================================== */
const form = ref({
  recipientName: '',
  recipientPhone: '',
  addressDetail: '',
  province: '',
  district: '',
  commune: '',
  isDefault: false,
  latitude: null,
  longitude: null,
})

/* =====================================================
 * UI STATE
 * ===================================================== */
const errors = ref({})
const isLocating = ref(false)
const isGeocoding = ref(false)

/* =====================================================
 * ADMIN UNITS (ESGOO)
 * ===================================================== */
const provinces = ref([])
const districts = ref([])
const communes = ref([])

const selectedProvinceId = ref('')
const selectedDistrictId = ref('')
const selectedCommuneId = ref('')

/* =====================================================
 * FETCH ADMIN UNITS
 * ===================================================== */
const fetchProvinces = async () => {
  const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
  if (res.data?.error === 0) provinces.value = res.data.data
}

const fetchDistricts = async (provinceId) => {
  districts.value = []
  communes.value = []
  if (!provinceId) return

  const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`)
  if (res.data?.error === 0) districts.value = res.data.data
}

const fetchCommunes = async (districtId) => {
  communes.value = []
  if (!districtId) return

  const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`)
  if (res.data?.error === 0) communes.value = res.data.data
}

/* =====================================================
 * CASCADING EVENT HANDLERS
 * Thay vì dùng Watch để clear (gây bug khi auto-fill),
 * ta chuyển sang bắt sự kiện @change trên thẻ <select>.
 * ===================================================== */
const onProvinceChange = async () => {
  const p = provinces.value.find((x) => x.id === selectedProvinceId.value)
  form.value.province = p?.full_name || ''

  selectedDistrictId.value = ''
  selectedCommuneId.value = ''
  form.value.district = ''
  form.value.commune = ''

  await fetchDistricts(selectedProvinceId.value)
}

const onDistrictChange = async () => {
  const d = districts.value.find((x) => x.id === selectedDistrictId.value)
  form.value.district = d?.full_name || ''

  selectedCommuneId.value = ''
  form.value.commune = ''

  await fetchCommunes(selectedDistrictId.value)
}

const onCommuneChange = () => {
  const c = communes.value.find((x) => x.id === selectedCommuneId.value)
  form.value.commune = c?.full_name || ''
}

/* =====================================================
 * LIFECYCLE
 * ===================================================== */
onMounted(fetchProvinces)

watch(
  () => props.show,
  async (open) => {
    if (!open) return

    errors.value = {}

    if (props.isEdit && props.initialData) {
      // --- SET FORM ---
      form.value = {
        recipientName: props.initialData.recipientName ?? '',
        recipientPhone: props.initialData.recipientPhone ?? '',
        addressDetail: props.initialData.addressDetail ?? '',
        province: props.initialData.province ?? '',
        district: props.initialData.district ?? '',
        commune: props.initialData.commune ?? '',
        isDefault: props.initialData.isDefault ?? false,
        latitude: props.initialData.latitude ?? null,
        longitude: props.initialData.longitude ?? null,
      }

      // --- SYNC DROPDOWNS ---
      await nextTick()

      selectedProvinceId.value =
        provinces.value.find((p) => p.full_name === form.value.province)?.id || ''
      if (selectedProvinceId.value) {
        await fetchDistricts(selectedProvinceId.value)
      }

      selectedDistrictId.value =
        districts.value.find((d) => d.full_name === form.value.district)?.id || ''
      if (selectedDistrictId.value) {
        await fetchCommunes(selectedDistrictId.value)
      }

      selectedCommuneId.value =
        communes.value.find((c) => c.full_name === form.value.commune)?.id || ''
    } else {
      resetForm()
    }
  },
)

/* =====================================================
 * HELPERS
 * ===================================================== */
const resetForm = () => {
  form.value = {
    recipientName: '',
    recipientPhone: '',
    addressDetail: '',
    province: '',
    district: '',
    commune: '',
    isDefault: false,
    latitude: null,
    longitude: null,
  }

  selectedProvinceId.value = ''
  selectedDistrictId.value = ''
  selectedCommuneId.value = ''
}

const validate = () => {
  errors.value = {}
  let ok = true

  if (!props.forStore) {
    if (!form.value.recipientName) {
      errors.value.recipientName = 'Vui lòng nhập tên người nhận'
      ok = false
    }

    if (!form.value.recipientPhone) {
      errors.value.recipientPhone = 'Vui lòng nhập số điện thoại'
      ok = false
    }
  }

  if (!form.value.addressDetail) {
    errors.value.addressDetail = 'Vui lòng nhập địa chỉ chi tiết'
    ok = false
  }

  if (!form.value.province || !form.value.district || !form.value.commune) {
    errors.value.region = 'Vui lòng chọn đầy đủ Tỉnh / Huyện / Xã'
    ok = false
  }

  if (
    form.value.latitude !== null && form.value.longitude !== null &&
    (form.value.latitude < 8 ||
    form.value.latitude > 24 ||
    form.value.longitude < 102 ||
    form.value.longitude > 110)
  ) {
    errors.value.location = 'Tọa độ không hợp lệ tại Việt Nam'
    ok = false
  }

  return ok
}

/* =====================================================
 * PAYLOAD BUILDER (MATCH AddressCreateDto)
 * ===================================================== */
const buildPayload = () => {
  const addressDetail = form.value.addressDetail.trim()

  const fullAddress = [addressDetail, form.value.commune, form.value.district, form.value.province]
    .filter(Boolean)
    .join(', ')

  const payload = {
    addressDetail,
    fullAddress,
    province: form.value.province,
    district: form.value.district,
    commune: form.value.commune,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
    isDefault: form.value.isDefault,
  }

  // CHỈ gửi recipient khi là User Address
  if (!props.forStore) {
    payload.recipientName = form.value.recipientName.trim()
    payload.recipientPhone = form.value.recipientPhone.trim()
  }

  return payload
}

const handleSubmit = async () => {
  if (!validate()) return

  // Tự động gọi Forward Geocoding nếu user chưa lấy tọa độ
  if (typeof form.value.latitude !== 'number' || typeof form.value.longitude !== 'number') {
    isGeocoding.value = true
    try {
      const q = `${form.value.commune}, ${form.value.district}, ${form.value.province}`
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { format: 'json', limit: 1, countrycodes: 'vn', q }
      })
      if (res.data?.length) {
        form.value.latitude = Number(res.data[0].lat)
        form.value.longitude = Number(res.data[0].lon)
      } else {
        toast.show({ type: 'warning', message: 'Không thể tìm thấy tọa độ tự động. Sẽ lưu không có tọa độ.' })
      }
    } catch {
      toast.show({ type: 'warning', message: 'Lỗi khi gọi lấy tọa độ ngầm. Sẽ lưu không có tọa độ.' })
    } finally {
      isGeocoding.value = false
    }
  }

  emit('submit', buildPayload())
}

/* =====================================================
 * FUZZY MATCH (Bóc tách chuỗi để Map với ID của Esgoo)
 * ===================================================== */
const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/^(tinh|thanh pho|quan|huyen|phuong|xa|thi xa|thi tran|tp)\s+/g, '')
    .trim()
}

const fuzzyMatchLocation = async (provStr, distStr, commStr) => {
  if (!provinces.value.length) await fetchProvinces()

  const normProv = normalizeText(provStr)
  const matchedProv = provinces.value.find(p => {
    const np = normalizeText(p.full_name)
    return np === normProv || np.includes(normProv) || normProv.includes(np)
  })

  if (!matchedProv) return

  // ===== PROVINCE =====
  selectedProvinceId.value = matchedProv.id
  form.value.province = matchedProv.full_name

  await fetchDistricts(matchedProv.id)
  await nextTick() // 🔥 QUAN TRỌNG

  // ===== DISTRICT =====
  if (distStr) {
    const normDist = normalizeText(distStr)

    const matchedDist = districts.value.find(d => {
      const nd = normalizeText(d.full_name)
      return nd === normDist || nd.includes(normDist) || normDist.includes(nd)
    })

    if (!matchedDist) return

    selectedDistrictId.value = matchedDist.id
    form.value.district = matchedDist.full_name

    await fetchCommunes(matchedDist.id)
    await nextTick() // 🔥 QUAN TRỌNG

    // ===== COMMUNE =====
    if (commStr) {
      const normComm = normalizeText(commStr)

      const matchedComm = communes.value.find(c => {
        const nc = normalizeText(c.full_name)
        return nc === normComm || nc.includes(normComm) || normComm.includes(nc)
      })

      if (matchedComm) {
        selectedCommuneId.value = matchedComm.id
        form.value.commune = matchedComm.full_name
      }
    }
  }
}

/* =====================================================
 * GEOLOCATION (CURRENT POSITION & REVERSE GEOCODING)
 * ===================================================== */
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.show({ type: 'error', message: 'Trình duyệt không hỗ trợ lấy vị trí.' })
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      form.value.latitude = pos.coords.latitude
      form.value.longitude = pos.coords.longitude

      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            format: 'json',
            lat: form.value.latitude,
            lon: form.value.longitude,
            'accept-language': 'vi'
          }
        })

        const addr = res.data?.address
        console.log('FULL ADDRESS:', addr)
        if (addr) {
          const provStr = addr.state || addr.city || addr.province || ''
          const distStr = addr.county || addr.district || addr.town || addr.city_district || ''
          const commStr = addr.suburb || addr.village || addr.hamlet || addr.quarter || ''

          console.log('districts:', districts.value)
          console.log('target:', distStr)
          await fuzzyMatchLocation(provStr, distStr, commStr)

          if (addr.road || addr.house_number) {
            form.value.addressDetail = [addr.house_number, addr.road].filter(Boolean).join(' ')
          }
        }
        toast.show({ type: 'success', message: 'Đã lấy vị trí hiện tại' })
      } catch (err) {
        toast.show({ type: 'warning', message: 'Đã lấy tọa độ nhưng không thể tự động điền địa chỉ' })
      } finally {
        isLocating.value = false
      }
    },
    () => {
      toast.show({ type: 'error', message: 'Không thể truy cập vị trí hiện tại (Hãy cấp quyền)' })
      isLocating.value = false
    },
  )

}

</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal -->
    <div
      class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto animate-fade-in-up"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- GEO ACTIONS -->
        <div class="flex">
          <button
            @click.prevent="getCurrentLocation"
            :disabled="isLocating"
            class="w-full py-2.5 px-4 bg-green-50 text-green-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 font-bold text-sm border border-blue-200 disabled:opacity-60 transition-colors"
          >
            <span v-if="isLocating" class="animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
</svg>

            </span>
            {{ form.latitude ? 'Cập nhật lại địa chỉ hiện tại' : 'Lấy địa chỉ hiện tại' }}
          </button>
        </div>

        <!-- COORDINATES -->
        <!-- <div
          v-if="form.latitude"
          class="text-xs text-center text-green-700 font-mono bg-green-50 p-2 rounded border border-green-200"
        >
          Lat: {{ form.latitude.toFixed(6) }} | Lng: {{ form.longitude.toFixed(6) }}
        </div> -->

        <p v-if="errors.location" class="error-msg">
          {{ errors.location }}
        </p>

        <!-- RECIPIENT INFO -->
        <div v-if="!forStore" class="grid grid-cols-2 gap-4">
          <div>
            <label class="label"> Tên người nhận <span class="text-red-500">*</span> </label>
            <input v-model="form.recipientName" class="input" placeholder="Nguyễn Văn A" />
            <p v-if="errors.recipientName" class="error-msg">
              {{ errors.recipientName }}
            </p>
          </div>

          <div>
            <label class="label"> Số điện thoại <span class="text-red-500">*</span> </label>
            <input v-model="form.recipientPhone" class="input" placeholder="0987xxxxxx" />
            <p v-if="errors.recipientPhone" class="error-msg">
              {{ errors.recipientPhone }}
            </p>
          </div>
        </div>

        <!-- ADMIN REGIONS -->
        <div
          class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3"
        >
          <p class="text-xs font-bold text-gray-500 uppercase">Khu vực hành chính</p>

          <select v-model="selectedProvinceId" @change="onProvinceChange" class="input cursor-pointer">
            <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
            <option v-for="p in provinces" :key="p.id" :value="p.id">
              {{ p.full_name }}
            </option>
          </select>

          <select
            v-model="selectedDistrictId"
            @change="onDistrictChange"
            class="input cursor-pointer"
            :disabled="!selectedProvinceId"
          >
            <option value="" disabled>-- Chọn Quận / Huyện --</option>
            <option v-for="d in districts" :key="d.id" :value="d.id">
              {{ d.full_name }}
            </option>
          </select>

          <select
            v-model="selectedCommuneId"
            @change="onCommuneChange"
            class="input cursor-pointer"
            :disabled="!selectedDistrictId"
          >
            <option value="" disabled>-- Chọn Phường / Xã --</option>
            <option v-for="c in communes" :key="c.id" :value="c.id">
              {{ c.full_name }}
            </option>
          </select>

          <p v-if="errors.region" class="error-msg">
            {{ errors.region }}
          </p>
        </div>

        <!-- ADDRESS DETAIL -->
        <div>
          <label class="label"> Số nhà, Tên đường <span class="text-red-500">*</span> </label>
          <textarea
            v-model="form.addressDetail"
            rows="2"
            class="input resize-none"
            placeholder="Số 12, đường ABC..."
          ></textarea>
          <p v-if="errors.addressDetail" class="error-msg">
            {{ errors.addressDetail }}
          </p>
        </div>

        <!-- DEFAULT -->
        <div v-if="!forStore" class="flex items-center">
          <input
            id="modal-default"
            type="checkbox"
            v-model="form.isDefault"
            class="w-4 h-4 text-green-600 rounded cursor-pointer"
          />
          <label
            for="modal-default"
            class="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            Đặt làm địa chỉ mặc định
          </label>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button @click="$emit('close')" class="btn-secondary">Hủy bỏ</button>
        <button @click="handleSubmit" class="btn-primary flex items-center justify-center gap-2" :disabled="isGeocoding">
          <span v-if="isGeocoding" class="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
          Lưu địa chỉ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply block text-xs font-bold text-gray-500 mb-1 uppercase;
}
.input {
  @apply w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm;
}
.error-msg {
  @apply text-xs text-red-500 mt-1;
}
.btn-primary {
  @apply px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply px-6 py-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors;
}
</style>
