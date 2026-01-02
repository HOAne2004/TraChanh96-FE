<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { useModalStore } from '@/stores/modal'

const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  initialData: Object
})

const emit = defineEmits(['close', 'submit'])
const modalStore = useModalStore()

// State Form
const form = ref({
  recipientName: '',
  recipientPhone: '',
  street: '',
  city: '',      // Lưu Tên Tỉnh
  district: '',  // Lưu Tên Huyện
  ward: '',      // Lưu Tên Xã
  isDefault: false,
  latitude: null,
  longitude: null
})

// State cho dữ liệu hành chính
const provinces = ref([])
const districts = ref([])
const wards = ref([])

// State lưu ID để call API (Vì form lưu Tên, nên cần biến riêng lưu ID)
const selectedProvinceId = ref('')
const selectedDistrictId = ref('')
const selectedWardId = ref('')

const isLocating = ref(false)
const errors = ref({})

// --- 1. LOGIC CALL API HÀNH CHÍNH (Sử dụng esgoo.net - Free & Stable) ---
const fetchProvinces = async () => {
  try {
    const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
    if (res.data.error === 0) provinces.value = res.data.data
  } catch (e) {
    console.error('Lỗi tải tỉnh thành:', e)
  }
}

const fetchDistricts = async (provinceId) => {
  districts.value = []
  wards.value = []
  if (!provinceId) return
  try {
    const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`)
    if (res.data.error === 0) districts.value = res.data.data
  } catch (e) { console.error(e) }
}

const fetchWards = async (districtId) => {
  wards.value = []
  if (!districtId) return
  try {
    const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`)
    if (res.data.error === 0) wards.value = res.data.data
  } catch (e) { console.error(e) }
}

// Watchers để xử lý logic Cascading (Chọn cha -> Reset con)
watch(selectedProvinceId, (newVal) => {
  // Tìm tên tỉnh dựa vào ID
  const province = provinces.value.find(p => p.id === newVal)
  form.value.city = province ? province.full_name : ''

  // Reset cấp dưới
  selectedDistrictId.value = ''
  selectedWardId.value = ''
  form.value.district = ''
  form.value.ward = ''

  // Load quận huyện
  fetchDistricts(newVal)
})

watch(selectedDistrictId, (newVal) => {
  const dist = districts.value.find(d => d.id === newVal)
  form.value.district = dist ? dist.full_name : ''

  selectedWardId.value = ''
  form.value.ward = ''

  fetchWards(newVal)
})

watch(selectedWardId, (newVal) => {
  const w = wards.value.find(x => x.id === newVal)
  form.value.ward = w ? w.full_name : ''
})

// --- LIFECYCLE ---
onMounted(() => {
  fetchProvinces()
})

// Reset form & Map dữ liệu khi mở Modal
watch(() => props.show, (val) => {
  if (val) {
    if (props.isEdit && props.initialData) {
      form.value = { ...props.initialData }
      // Lưu ý: Việc map lại ID từ Tên (khi sửa) khá phức tạp nếu API không hỗ trợ search theo tên.
      // Ở mức đơn giản, ta chấp nhận người dùng phải chọn lại Tỉnh/Huyện/Xã khi sửa,
      // Hoặc chỉ hiển thị text cũ.
    } else {
      resetForm()
    }
    errors.value = {}
  }
})

const resetForm = () => {
  form.value = {
    recipientName: '', recipientPhone: '', street: '',
    city: '', district: '', ward: '',
    isDefault: false, latitude: null, longitude: null
  }
  selectedProvinceId.value = ''
  selectedDistrictId.value = ''
  selectedWardId.value = ''
}

// --- VALIDATION & SUBMIT (Giữ nguyên) ---
const validate = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.recipientName) { errors.value.recipientName = 'Nhập tên người nhận'; isValid = false }
  if (!form.value.recipientPhone) { errors.value.recipientPhone = 'Nhập SĐT'; isValid = false }
  if (!form.value.street) { errors.value.street = 'Nhập địa chỉ cụ thể'; isValid = false }

  // Check dropdown
  if (!selectedProvinceId.value || !selectedDistrictId.value || !selectedWardId.value) {
    errors.value.city = 'Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã.'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (validate()) {
    emit('submit', { ...form.value })
  }
}

// --- LOGIC ĐỊNH VỊ (Giữ nguyên nhưng chỉ fill tọa độ & tên đường) ---
// Việc auto-select dropdown từ tọa độ rất khó vì tên từ Google Map chưa chắc khớp 100% với tên trong API hành chính.
// Nên ta chỉ dùng định vị để lấy Tọa độ + Tên đường, còn Tỉnh/Huyện/Xã người dùng tự chọn cho chuẩn.
const getCurrentLocation = () => {
  if (!navigator.geolocation) return
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      form.value.latitude = position.coords.latitude
      form.value.longitude = position.coords.longitude

      // Có thể gọi Reverse Geocoding để lấy tên đường phố điền vào ô Street
      // Nhưng không nên cố gắng auto-select dropdown vì dễ sai lệch
      modalStore.showToast('Đã lấy tọa độ thành công. Vui lòng chọn địa chỉ hành chính.', 'success')
      isLocating.value = false
    },
    () => { isLocating.value = false }
  )
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">

      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div class="space-y-4">
        <button @click.prevent="getCurrentLocation" class="w-full py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 font-medium text-sm">
          <span v-if="isLocating" class="animate-spin">⌛</span>
          <span v-else>📍</span>
          {{ form.latitude ? 'Đã có tọa độ (Cập nhật lại)' : 'Lấy tọa độ hiện tại (Tính phí ship)' }}
        </button>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Tên người nhận <span class="text-red-500">*</span></label>
            <input v-model="form.recipientName" class="input" placeholder="Nguyễn Văn A" />
            <p v-if="errors.recipientName" class="error-msg">{{ errors.recipientName }}</p>
          </div>
          <div>
            <label class="label">Số điện thoại <span class="text-red-500">*</span></label>
            <input v-model="form.recipientPhone" class="input" placeholder="0987..." />
            <p v-if="errors.recipientPhone" class="error-msg">{{ errors.recipientPhone }}</p>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <p class="text-xs font-bold text-gray-500 uppercase mb-1">Khu vực hành chính</p>

          <div class="grid grid-cols-1 gap-3">
            <select v-model="selectedProvinceId" class="input cursor-pointer">
              <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
              <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.full_name }}</option>
            </select>

            <select v-model="selectedDistrictId" class="input cursor-pointer" :disabled="!selectedProvinceId">
              <option value="" disabled>-- Chọn Quận / Huyện --</option>
              <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.full_name }}</option>
            </select>

            <select v-model="selectedWardId" class="input cursor-pointer" :disabled="!selectedDistrictId">
              <option value="" disabled>-- Chọn Phường / Xã --</option>
              <option v-for="w in wards" :key="w.id" :value="w.id">{{ w.full_name }}</option>
            </select>
          </div>
          <p v-if="errors.city" class="error-msg">{{ errors.city }}</p>
        </div>

        <div>
          <label class="label">Số nhà, Tên đường <span class="text-red-500">*</span></label>
          <textarea v-model="form.street" rows="2" class="input resize-none" placeholder="Số 12, Ngõ 3..."></textarea>
          <p v-if="errors.street" class="error-msg">{{ errors.street }}</p>
        </div>

        <div class="flex items-center">
          <input id="modal-default" type="checkbox" v-model="form.isDefault" class="w-4 h-4 text-green-600 rounded cursor-pointer" />
          <label for="modal-default" class="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">Đặt làm mặc định</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button @click="$emit('close')" class="btn-secondary">Hủy bỏ</button>
        <button @click="handleSubmit" class="btn-primary">Lưu địa chỉ</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-xs font-bold text-gray-500 mb-1 uppercase; }
.input { @apply w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm; }
.error-msg { @apply text-xs text-red-500 mt-1; }
.btn-primary { @apply px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all; }
.btn-secondary { @apply px-6 py-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors; }
</style>
