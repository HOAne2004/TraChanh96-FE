<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useStaffStore } from '@/stores/identity/staff.store'
import { useToastStore } from '@/stores/system/toast.store'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  storeId: { type: Number, required: true },
  staffData: { type: Object, default: null },
  isManagerLimitReached: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'refresh'])

const staffStore = useStaffStore()
const toastStore = useToastStore()
const submitting = ref(false)

const POSITIONS = [
  { value: 10, backendKey: 'StoreManager', label: 'Quản lý cửa hàng' },
  { value: 11, backendKey: 'Barista', label: 'Nhân viên pha chế' },
  { value: 12, backendKey: 'Cashier', label: 'Nhân viên thu ngân' },
  { value: 13, backendKey: 'Server', label: 'Nhân viên phục vụ' },
  { value: 14, backendKey: 'Security', label: 'Bảo vệ' },
]

const SALARY_TYPES = [
  { value: 1, label: 'FullTime' }, 
  { value: 2, label: 'PartTime' }
]

const isEditMode = computed(() => !!props.staffData)

const formData = reactive({
  id: null,
  email: '',     
  phone: '',     
  password: '',  
  fullName: '',
  position: 11, 
  salaryType: 2, 
  baseSalary: '',
  hourlySalary: '',
  citizenId: '',
  address: ''
})

// Cập nhật dữ liệu mỗi khi mở Modal
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.staffData) {
      const posObj = POSITIONS.find(p => p.label === props.staffData.position)
      const salObj = SALARY_TYPES.find(p => p.label === props.staffData.salaryType)
      
      Object.assign(formData, {
        id: props.staffData.id,
        email: props.staffData.email || '',
        phone: props.staffData.phone || '',
        password: '', // Không hiển thị pass cũ
        fullName: props.staffData.fullName || '',
        position: posObj ? posObj.value : 11,
        salaryType: salObj ? salObj.value : 2,
        baseSalary: props.staffData.baseSalary || '',
        hourlySalary: props.staffData.hourlySalary || '',
        citizenId: props.staffData.citizenId || '',
        address: props.staffData.address || ''
      })
    } else {
      // Reset form khi Thêm mới
      Object.assign(formData, {
        id: null, email: '', phone: '', password: '', fullName: '', 
        position: 11, salaryType: 2, baseSalary: '', hourlySalary: '', citizenId: '', address: ''
      })
    }
  }
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      storeId: props.storeId,
      email: formData.email.trim(),
      phone: formData.phone?.trim() || null,
      password: formData.password?.trim() || null,
      fullName: formData.fullName.trim(),
      position: Number(formData.position),
      salaryType: Number(formData.salaryType),
      citizenId: formData.citizenId?.trim() || null,
      address: formData.address?.trim() || null,
      baseSalary: Number(formData.salaryType) === 1 ? (Number(formData.baseSalary) || null) : null,
      hourlySalary: Number(formData.salaryType) === 2 ? (Number(formData.hourlySalary) || null) : null,
    }

    if (isEditMode.value) {
      await staffStore.updateStaffAction(formData.id, payload, { storeId: props.storeId })
      toastStore.show({ message: 'Cập nhật thông tin thành công', type: 'success' })
    } else {
      await staffStore.createStaffAction(payload)
      toastStore.show({ message: 'Thêm nhân viên thành công', type: 'success' })
    }
    
    emit('refresh') // Yêu cầu tab cha tải lại danh sách
    emit('close')   // Đóng modal
  } catch (error) {
    console.error(error)
    let errorMsg = 'Kiểm tra lại dữ liệu nhập (Lỗi 400)'
    if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0]
        errorMsg = error.response.data.errors[firstKey][0]
    } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
    }
    toastStore.show({ message: errorMsg, type: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-lg font-bold text-gray-900">
          {{ isEditMode ? 'Sửa thông tin nhân sự' : 'Thêm nhân sự mới' }}
        </h3>
        <button @click="$emit('close')" type="button" class="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-md shadow-sm border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col flex-1 overflow-hidden">
        
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <div v-if="!isEditMode" class="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
            <h4 class="text-sm font-black text-blue-900 uppercase tracking-wider mb-2">Tài khoản đăng nhập hệ thống</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-blue-900 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="formData.email" type="email" required class="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 text-sm" placeholder="nv.a@drink.vn" />
              </div>
              <div>
                <label class="block text-xs font-bold text-blue-900 mb-1">Số điện thoại</label>
                <input v-model="formData.phone" type="text" class="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 text-sm" placeholder="0987654321" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-blue-900 mb-1">Mật khẩu</label>
              <input v-model="formData.password" type="text" class="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 text-sm bg-white" placeholder="Mặc định: Staff@123" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span class="text-red-500">*</span></label>
              <input v-model="formData.fullName" type="text" required class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CCCD / CMND</label>
              <input v-model="formData.citizenId" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm" placeholder="001202..." />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Chức vụ <span class="text-red-500">*</span></label>
              <select v-model="formData.position" class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm">
                <option v-for="pos in POSITIONS" :key="pos.value" :value="pos.value" :disabled="pos.value === 1 && isManagerLimitReached && (!isEditMode || formData.position !== 1)">
                  {{ pos.label }} {{ (pos.value === 1 && isManagerLimitReached && (!isEditMode || formData.position !== 1)) ? '(Đã đầy)' : '' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hình thức lương <span class="text-red-500">*</span></label>
              <select v-model="formData.salaryType" class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm">
                <option v-for="type in SALARY_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-if="formData.salaryType === 1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản (VNĐ/tháng) <span class="text-red-500">*</span></label>
              <input v-model="formData.baseSalary" type="number" required class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm" placeholder="Ví dụ: 8000000" />
            </div>
            <div v-if="formData.salaryType === 2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Lương theo giờ (VNĐ/giờ) <span class="text-red-500">*</span></label>
              <input v-model="formData.hourlySalary" type="number" required class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm" placeholder="Ví dụ: 25000" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
            <textarea v-model="formData.address" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-green-500 text-sm"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors">
            Hủy bỏ
          </button>
          <button type="submit" :disabled="submitting" class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm shadow-green-200">
            <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isEditMode ? 'Lưu thay đổi' : 'Xác nhận Thêm' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>