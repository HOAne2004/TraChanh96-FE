<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useToastStore } from '@/stores/toast'

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
 * CASCADING WATCHERS
 * ===================================================== */
watch(selectedProvinceId, async (id) => {
  const p = provinces.value.find(x => x.id === id)
  form.value.province = p?.full_name || ''

  selectedDistrictId.value = ''
  selectedCommuneId.value = ''
  form.value.district = ''
  form.value.commune = ''

  await fetchDistricts(id)
})

watch(selectedDistrictId, async (id) => {
  const d = districts.value.find(x => x.id === id)
  form.value.district = d?.full_name || ''
  selectedCommuneId.value = ''
  form.value.commune = ''
  await fetchCommunes(id)
})

watch(selectedCommuneId, async (id) => {
  const c = communes.value.find(x => x.id === id)
  form.value.commune = c?.full_name || ''
})

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
        provinces.value.find(p => p.full_name === form.value.province)?.id || ''

      await fetchDistricts(selectedProvinceId.value)

      selectedDistrictId.value =
        districts.value.find(d => d.full_name === form.value.district)?.id || ''

      await fetchCommunes(selectedDistrictId.value)

      selectedCommuneId.value =
        communes.value.find(c => c.full_name === form.value.commune)?.id || ''
    } else {
      resetForm()
    }
  }
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

  if (typeof form.value.latitude !== 'number' || typeof form.value.longitude !== 'number') {
    errors.value.location = 'Vui lòng lấy tọa độ địa chỉ'
    ok = false
  }

  if (
    form.value.latitude < 8 ||
    form.value.latitude > 24 ||
    form.value.longitude < 102 ||
    form.value.longitude > 110
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

  const fullAddress = [
    addressDetail,
    form.value.commune,
    form.value.district,
    form.value.province,
  ].filter(Boolean).join(', ')

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

const handleSubmit = () => {
  if (!validate()) return

  if (typeof form.value.latitude !== 'number' || typeof form.value.longitude !== 'number') {
    toast.show({
      type: 'warning',
      message: 'Vui lòng lấy tọa độ trước khi lưu địa chỉ',
    })
    return
  }

  emit('submit', buildPayload())
}

/* =====================================================
 * GEOLOCATION (CURRENT POSITION)
 * ===================================================== */
const getCurrentLocation = () => {
  if (!navigator.geolocation) return

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.latitude = pos.coords.latitude
      form.value.longitude = pos.coords.longitude
      toast.show({ type: 'success', message: 'Đã lấy tọa độ hiện tại' })
      isLocating.value = false
    },
    () => {
      toast.show({ type: 'error', message: 'Không thể lấy vị trí hiện tại' })
      isLocating.value = false
    },
  )
}

/* =====================================================
 * GEOCODING (WARD → DISTRICT → PROVINCE)
 * ===================================================== */
const geocodeAddress = async () => {
  isGeocoding.value = true

  const queries = [
    `${form.value.commune}, ${form.value.district}, ${form.value.province}`,
    `${form.value.district}, ${form.value.province}`,
    `${form.value.province}`,
  ]

  try {
    for (const q of queries) {
      if (!q.trim()) continue

      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          format: 'json',
          limit: 1,
          countrycodes: 'vn',
          q,
        },
      })

      if (res.data?.length) {
        form.value.latitude = Number(res.data[0].lat)
        form.value.longitude = Number(res.data[0].lon)

        toast.show({
          type: 'success',
          message: `Đã lấy tọa độ theo: ${q}`,
        })
        return
      }
    }

    toast.show({
      type: 'warning',
      message: 'Không tìm thấy tọa độ phù hợp – sẽ tính phí thủ công',
    })
  } catch {
    toast.show({ type: 'error', message: 'Lỗi kết nối bản đồ' })
  } finally {
    isGeocoding.value = false
  }
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
        <div class="grid grid-cols-2 gap-3">
          <button
            @click.prevent="getCurrentLocation"
            :disabled="isLocating"
            class="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 font-medium text-xs border border-blue-200 disabled:opacity-60"
          >
            <span v-if="isLocating" class="animate-spin">⌛</span>
            <span v-else>📍</span>
            {{ form.latitude ? 'Cập nhật tọa độ hiện tại' : 'Lấy tọa độ hiện tại' }}
          </button>

          <button
            @click.prevent="geocodeAddress"
            :disabled="isGeocoding || !form.province"
            class="py-2 px-3 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-100 font-medium text-xs border border-orange-200 disabled:opacity-60"
          >
            <span v-if="isGeocoding" class="animate-spin">⌛</span>
            <span v-else>🔍</span>
            Lấy tọa độ từ địa chỉ
          </button>
        </div>

        <!-- COORDINATES -->
        <div
          v-if="form.latitude"
          class="text-xs text-center text-green-700 font-mono bg-green-50 p-2 rounded border border-green-200"
        >
          Lat: {{ form.latitude.toFixed(6) }} | Lng: {{ form.longitude.toFixed(6) }}
        </div>

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

          <select v-model="selectedProvinceId" class="input cursor-pointer">
            <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
            <option v-for="p in provinces" :key="p.id" :value="p.id">
              {{ p.full_name }}
            </option>
          </select>

          <select
            v-model="selectedDistrictId"
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
        <button @click="handleSubmit" class="btn-primary">Lưu địa chỉ</button>
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
  @apply px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all;
}
.btn-secondary {
  @apply px-6 py-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors;
}
</style>
