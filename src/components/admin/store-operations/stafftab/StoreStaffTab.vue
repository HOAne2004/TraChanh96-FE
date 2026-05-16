<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStaffStore } from '@/stores/identity/staff.store'
import { formatPrice } from '@/utils/formatters'
import StoreStaffModal from './StoreStaffModal.vue'

const props = defineProps({
  store: { type: Object, required: true }
})

const staffStore = useStaffStore()
const { staffs, loading } = storeToRefs(staffStore)

const search = ref('')

// State quản lý Modal
const showModal = ref(false)
const selectedStaff = ref(null)

// Load dữ liệu
const fetchStaffs = async () => {
  await staffStore.fetchStaffs({ storeId: props.store.id })
}

onMounted(fetchStaffs)

// Phân loại nhân sự
const validStaffs = computed(() => {
  let list = staffs.value.filter(s => s.status !== 'Deleted' && s.status !== 'Inactive')
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s => s.fullName.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q)))
  }
  return list
})

const managers = computed(() => {
  return validStaffs.value.filter(s => s.position === 'StoreManager')
})

const regularStaffs = computed(() => {
  return validStaffs.value.filter(s => s.position !== 'StoreManager')
})

const isManagerLimitReached = computed(() => managers.value.length >= 2)

// Hành động
const openCreateModal = () => {
  selectedStaff.value = null // Null nghĩa là thêm mới
  showModal.value = true
}

const openEditModal = (staff) => {
  selectedStaff.value = staff
  showModal.value = true
}

const handleDelete = async (id) => {
  if(confirm("Bạn có chắc muốn xóa nhân sự này không?")) {
    try {
      await staffStore.deleteStaffAction(id, { storeId: props.store.id })
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
      <div class="relative w-full sm:w-80">
        <input 
          v-model="search"
          type="text" 
          placeholder="Tìm kiếm nhân viên (Tên, Email)..."
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm outline-none transition-all"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-medium transition-colors text-sm shadow-sm shadow-green-200 w-full sm:w-auto justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Thêm Nhân Sự
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin h-8 w-8 text-green-500 border-4 border-current border-t-transparent rounded-full"></div>
    </div>

    <div v-else class="space-y-8">
      
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-amber-500"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" /></svg>
            Ban Quản Lý ({{ managers.length }}/2)
          </h3>
          <span v-if="isManagerLimitReached" class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
            Đã đạt giới hạn Quản lý
          </span>
        </div>
        
        <div v-if="managers.length === 0" class="text-sm text-gray-500 italic p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center">
          Cửa hàng chưa có Quản lý nào. Hãy thêm ngay!
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="mgr in managers" :key="mgr.id" class="bg-gradient-to-r from-amber-50 to-white rounded-2xl border border-amber-100 p-5 shadow-sm flex items-center gap-4 relative group">
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button @click="openEditModal(mgr)" class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg></button>
              <button @click="handleDelete(mgr.id)" class="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5z" clip-rule="evenodd" /></svg></button>
            </div>

            <img :src="mgr.userAvatar || '/default-avatar.png'" class="w-16 h-16 rounded-full border-2 border-amber-200 object-cover shadow-sm" 
            v-img-fallback="'drink'" />
            <div>
              <h4 class="font-black text-lg text-gray-900">{{ mgr.fullName }}</h4>
              <p class="text-sm font-medium text-amber-700 mt-0.5">{{ mgr.position }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg> {{ mgr.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-blue-500"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" /></svg>
          Đội ngũ Nhân viên
        </h3>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50/80">
                <tr>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân viên</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chức vụ</th>
                  <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại lương</th>
                  <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mức lương</th>
                  <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-if="regularStaffs.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">Chưa có nhân viên nào.</td>
                </tr>
                <tr v-for="staff in regularStaffs" :key="staff.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <img :src="staff.userAvatar || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                      v-img-fallback="'drink'" />
                      <div>
                        <div class="text-sm font-bold text-gray-900">{{ staff.fullName }}</div>
                        <div class="text-xs text-gray-500">{{ staff.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      {{ staff.position }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ staff.salaryType }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    <span v-if="staff.hourlySalary">{{ formatPrice(staff.hourlySalary) }}đ / giờ</span>
                    <span v-else-if="staff.baseSalary">{{ formatPrice(staff.baseSalary) }}đ / tháng</span>
                    <span v-else class="text-gray-400 italic">Chưa xét</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="openEditModal(staff)" class="text-blue-600 hover:text-blue-900 mr-3">Sửa</button>
                    <button @click="handleDelete(staff.id)" class="text-red-600 hover:text-red-900">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <StoreStaffModal 
      :is-open="showModal" 
      :store-id="store.id" 
      :staff-data="selectedStaff" 
      :is-manager-limit-reached="isManagerLimitReached"
      @close="showModal = false"
      @refresh="fetchStaffs"
    />

  </div>
</template>