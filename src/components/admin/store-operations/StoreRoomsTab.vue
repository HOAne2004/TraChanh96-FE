<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/store-operations/room.store'
import { useShopTableStore } from '@/stores/store-operations/shopTable.store'
import { useToastStore } from '@/stores/system/toast.store'
import RoomFormModal from '@/components/admin/store-operations/RoomFormModal.vue'
import ShopTableFormModal from '@/components/admin/store-operations/ShopTableFormModal.vue'

const props = defineProps({
  store: { type: Object, required: true }
})

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const tableStore = useShopTableStore()
const toastStore = useToastStore()

const loading = ref(true)
const selectedRoomId = ref(null) // State lưu ID phòng đang được chọn
const selectedTable = ref(null)

// State Modal
const showRoomModal = ref(false)
const isEditRoom = ref(false)
const currentRoomData = ref(null)

const showTableModal = ref(false)
const isEditTable = ref(false)
const currentTableData = ref(null)

// --- HOOKS ---
onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  await Promise.all([
    roomStore.fetchAdminRooms({ storeId: props.store.id }),
    tableStore.fetchTables(props.store.id)
  ])
  loading.value = false

  // Tự động chọn phòng đầu tiên nếu chưa chọn
  if (roomStore.adminRooms.length > 0 && selectedRoomId.value === null) {
    selectedRoomId.value = roomStore.adminRooms[0].id
  }
}

// --- LOGIC GIAO DIỆN CHỌN PHÒNG ---
// Tạo danh sách phòng (Gắn thêm phòng "Khác" nếu có bàn mồ côi)
const allRooms = computed(() => {
  const list = [...roomStore.adminRooms]
  const hasUnassignedTables = tableStore.tables.some(t => !t.roomId)
  if (hasUnassignedTables || list.length === 0) {
    list.push({ id: null, name: 'Khu vực chung / Khác' })
  }
  return list
})

const activeRoom = computed(() => {
  return allRooms.value.find(r => r.id === selectedRoomId.value) || allRooms.value[0]
})

const currentRoomTables = computed(() => {
  if (!activeRoom.value || !tableStore.tables) return []
  return tableStore.tables.filter(table => {
    if (activeRoom.value.id === null) {
      return !table.roomId // Bàn không thuộc phòng nào
    }
    return table.roomId === activeRoom.value.id
  })
})

const getStatusConfig = (status) => {
  // Map với Enum Backend: Available, Occupied, Reserved
  if (status === 'Occupied') return 'bg-red-100 text-red-700 border border-red-200'
  if (status === 'Reserved') return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  return 'bg-green-100 text-green-700 border border-green-200' // Available
}

const getStatusLabel = (status) => {
  if (status === 'Occupied') return 'Đang dùng'
  if (status === 'Reserved') return 'Đã đặt'
  return 'Trống'
}

// --- LOGIC CRUD PHÒNG ---
const handleOpenRoomModal = (isEdit = false) => {
  isEditRoom.value = isEdit
  if (isEdit && activeRoom.value && activeRoom.value.id !== null) {
    currentRoomData.value = { ...activeRoom.value }
  } else {
    currentRoomData.value = null
  }
  showRoomModal.value = true
}

const submitRoom = async (formData) => {
  try {
    const payload = { ...formData, storeId: props.store.id }
    if (isEditRoom.value) {
      await roomStore.updateRoomAction(currentRoomData.value.id, payload, props.store.id)
      toastStore.show({ message: 'Cập nhật phòng thành công', type: 'success' })
    } else {
      await roomStore.createRoomAction(payload)
      toastStore.show({ message: 'Thêm phòng thành công', type: 'success' })
      // Auto select phòng mới
      selectedRoomId.value = roomStore.adminRooms[roomStore.adminRooms.length - 1].id
    }
    showRoomModal.value = false
    await loadData()
  } catch (error) {}
}

const deleteRoom = async () => {
  if (!activeRoom.value || activeRoom.value.id === null) return
  try {
    const success = await roomStore.deleteRoomAction(activeRoom.value.id, props.store.id)
    if (success) {
      toastStore.show({ message: 'Xóa phòng thành công', type: 'success' })
      selectedRoomId.value = null // Reset selection
      await loadData()
    }
  } catch (error) {}
}

// --- LOGIC CRUD BÀN ---
const handleOpenTableModal = (isEdit = false, tableObj = null) => {
  isEditTable.value = isEdit
  if (isEdit && tableObj) {
    currentTableData.value = { ...tableObj }
  } else {
    // Nếu thêm mới, gán sẵn roomId bằng phòng đang chọn
    currentTableData.value = { roomId: activeRoom.value?.id || null }
  }
  showTableModal.value = true
}

const submitTable = async (formData) => {
  try {
    const payload = { ...formData, storeId: props.store.id }
    if (isEditTable.value) {
      await tableStore.updateTableAction(currentTableData.value.id, payload, props.store.id)
      toastStore.show({ message: 'Cập nhật bàn thành công', type: 'success' })
    } else {
      await tableStore.createTableAction(payload)
      toastStore.show({ message: 'Thêm bàn thành công', type: 'success' })
    }
    showTableModal.value = false
  } catch (error) {}
}

const deleteTable = async (tableId) => {
  try {
    const success = await tableStore.deleteTableAction(tableId, props.store.id)
    if (success) {
       toastStore.show({ message: 'Xóa bàn thành công', type: 'success' })
    }
  } catch (error) {}
}
</script>

<template>
  <div class="space-y-6">
    <!-- 🟢 HEADER & NÚT TỔNG -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
      <h2 class="text-xl font-bold text-gray-900">Quản lý Sơ đồ Bàn</h2>
      <div class="flex gap-3">
        <button
          @click="handleOpenRoomModal(false)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Thêm Khu Vực
        </button>
        <button
          @click="handleOpenTableModal(false)"
          class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm shadow-green-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Thêm Bàn
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin h-8 w-8 text-green-500 border-4 border-current border-t-transparent rounded-full"></div>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-6">

      <!-- 🟢 CỘT TRÁI: DANH SÁCH PHÒNG (TABS/SIDEBAR) -->
      <div class="w-full lg:w-64 shrink-0 space-y-2">
        <button
          v-for="room in allRooms"
          :key="room.id || 'other'"
          @click="selectedRoomId = room.id"
          class="w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex justify-between items-center group"
          :class="selectedRoomId === room.id ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-100'"
        >
          <span class="truncate">{{ room.name }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 🟢 CỘT PHẢI: KHU VỰC HIỂN THỊ BÀN -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6" v-if="activeRoom">

        <!-- Header Của Phòng -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Phòng: {{ activeRoom.name }}</h2>
            <p v-if="activeRoom.id !== null" class="text-sm text-gray-500 mt-1">
              Sức chứa: {{ activeRoom.capacity || 0 }} người
              <span v-if="activeRoom.isAirConditioned" class="ml-2 text-blue-500 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">❄️ Máy lạnh</span>
            </p>
          </div>

          <!-- Nút Sửa/Xóa Phòng -->
          <div class="flex gap-2" v-if="activeRoom.id !== null">
            <button @click="handleOpenRoomModal(true)" class="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors font-medium">Sửa Phòng</button>
            <button @click="deleteRoom" class="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors font-medium">Xóa Phòng</button>
          </div>
        </div>

        <!-- Legend Chú thích (Mẫu của bạn) -->
        <div class="flex gap-6 mb-6 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 w-max">
          <div class="flex items-center gap-2"><span class="w-3 h-3 bg-green-400 rounded-sm"></span> Trống</div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 bg-red-400 rounded-sm"></span> Đang dùng</div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 bg-yellow-400 rounded-sm"></span> Đã đặt</div>
        </div>

        <!-- Grid Hiển thị Bàn -->
        <div v-if="currentRoomTables.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="table in currentRoomTables"
            :key="table.id"
            @click="selectedTable = table"
            class="group p-5 rounded-xl shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md relative"
            :class="getStatusConfig(table.status)"
          >
            <!-- Lớp phủ Nút Hành Động khi Hover -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
              <button @click.stop="handleOpenTableModal(true, table)" class="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded shadow border border-blue-100" title="Sửa bàn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
              </button>
              <button @click.stop="deleteTable(table.id)" class="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded shadow border border-red-100" title="Xóa bàn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <!-- Nội dung Thẻ Bàn -->
            <div class="text-center font-extrabold text-xl">{{ table.name }}</div>
            <div class="text-[11px] font-medium text-center mt-1 uppercase tracking-wider">{{ getStatusLabel(table.status) }}</div>
            <div class="text-xs text-center mt-2 opacity-80 flex justify-center items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM7.256 16.71c-.015.01-.03.02-.046.03a4.998 4.998 0 01-5.541-7.87 6 6 0 0110.662 0 4.998 4.998 0 01-5.075 7.84z" /></svg>
              {{ table.capacity }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <p class="text-gray-500 font-medium">Chưa có bàn nào trong khu vực này.</p>
          <button @click="handleOpenTableModal(false)" class="text-green-600 text-sm font-bold mt-2 hover:underline">Thêm bàn ngay</button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RoomFormModal :show="showRoomModal" :isEdit="isEditRoom" :initialData="currentRoomData" @close="showRoomModal = false" @submit="submitRoom" />
    <ShopTableFormModal :show="showTableModal" :isEdit="isEditTable" :initialData="currentTableData" :rooms="roomStore.adminRooms" @close="showTableModal = false" @submit="submitTable" />
  </div>
</template>
