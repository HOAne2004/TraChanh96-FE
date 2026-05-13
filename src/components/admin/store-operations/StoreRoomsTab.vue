<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoomStore } from '@/stores/store-operations/room.store'
import { useShopTableStore } from '@/stores/store-operations/shopTable.store'
import { useToastStore } from '@/stores/system/toast.store'
import RoomFormModal from '@/components/admin/store-operations/RoomFormModal.vue'
import ShopTableFormModal from '@/components/admin/store-operations/ShopTableFormModal.vue'

const props = defineProps({
  store: { type: Object, required: true }
})

const roomStore = useRoomStore()
const tableStore = useShopTableStore()
const toastStore = useToastStore()

const loading = ref(true)
const selectedRoomId = ref(null) 
const selectedTable = ref(null)

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

  if (roomStore.adminRooms.length > 0 && selectedRoomId.value === null) {
    selectedRoomId.value = roomStore.adminRooms[0].id
  }
}

// --- LOGIC ---
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
    if (activeRoom.value.id === null) return !table.roomId 
    return table.roomId === activeRoom.value.id
  })
})

// 🟢 Tối ưu lại cấu hình Trạng thái để phục vụ cho UI mới
const getStatusConfig = (status) => {
  if (status === 'Occupied') return {
    cardClass: 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-red-100',
    dotClass: 'bg-red-500',
    pingClass: 'animate-ping bg-red-400', // Hiệu ứng nhấp nháy cho bàn đang có khách
    textClass: 'text-red-700'
  }
  if (status === 'Reserved') return {
    cardClass: 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-amber-100',
    dotClass: 'bg-amber-500',
    pingClass: 'hidden',
    textClass: 'text-amber-700'
  }
  return { // Available
    cardClass: 'bg-white border-green-200 hover:border-green-300 hover:shadow-green-100',
    dotClass: 'bg-green-500',
    pingClass: 'hidden',
    textClass: 'text-green-700'
  }
}

const getStatusLabel = (status) => {
  if (status === 'Occupied') return 'Đang dùng'
  if (status === 'Reserved') return 'Đã đặt'
  return 'Trống'
}

// --- ACTIONS CRUD (Giữ nguyên) ---
const handleOpenRoomModal = (isEdit = false) => {
  isEditRoom.value = isEdit
  currentRoomData.value = (isEdit && activeRoom.value && activeRoom.value.id !== null) ? { ...activeRoom.value } : null
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
      selectedRoomId.value = roomStore.adminRooms[roomStore.adminRooms.length - 1].id
    }
    showRoomModal.value = false
    await loadData()
  } catch (error) {
    toastStore.show({ message: 'Thao tác thất bại', type: 'error' })
  }
}

const deleteRoom = async () => {
  if (!activeRoom.value || activeRoom.value.id === null) return
  try {
    const success = await roomStore.deleteRoomAction(activeRoom.value.id, props.store.id)
    if (success) {
      toastStore.show({ message: 'Xóa phòng thành công', type: 'success' })
      selectedRoomId.value = null 
      await loadData()
    }
  } catch (error) {
    toastStore.show({ message: 'Xóa phòng thất bại', type: 'error' })
  }
}

const handleOpenTableModal = (isEdit = false, tableObj = null) => {
  isEditTable.value = isEdit
  currentTableData.value = (isEdit && tableObj) ? { ...tableObj } : { roomId: activeRoom.value?.id || null }
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
  } catch (error) {
    toastStore.show({ message: 'Thao tác thất bại', type: 'error' })
  }
}

const deleteTable = async (tableId) => {
  try {
    const success = await tableStore.deleteTableAction(tableId, props.store.id)
    if (success) toastStore.show({ message: 'Xóa bàn thành công', type: 'success' })
  } catch (error) {
    toastStore.show({ message: 'Xóa bàn thất bại', type: 'error' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
      <h2 class="text-xl font-bold text-gray-900">Quản lý Sơ đồ Bàn</h2>
      <div class="flex gap-3">
        <button
          @click="handleOpenRoomModal(false)"
          class="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Thêm Khu Vực
        </button>
        <button
          @click="handleOpenTableModal(false)"
          class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm shadow-sm shadow-green-200"
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

      <div class="w-full lg:w-64 shrink-0 space-y-2">
        <button
          v-for="room in allRooms"
          :key="room.id || 'other'"
          @click="selectedRoomId = room.id"
          class="w-full text-left px-4 py-3.5 rounded-2xl font-medium transition-all flex items-center group border"
          :class="selectedRoomId === room.id ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' : 'bg-white text-gray-700 hover:bg-green-50 border-gray-100 hover:border-green-200'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3 shrink-0" :class="selectedRoomId === room.id ? 'text-green-200' : 'text-gray-400 group-hover:text-green-500'">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span class="truncate flex-1">{{ room.name }}</span>
        </button>
      </div>

      <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6" v-if="activeRoom">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-gray-100 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ activeRoom.name }}</h2>
            <div v-if="activeRoom.id !== null" class="flex flex-wrap items-center gap-3 mt-2">
              <span class="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-400">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654z" />
                </svg>
                Sức chứa: {{ activeRoom.capacity || 0 }}
              </span>
              <span v-if="activeRoom.isAirConditioned" class="flex items-center gap-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-bold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <path d="M12 2v20M17 4l-5 5-5-5M17 20l-5-5-5 5M2 12h20M4 7l5 5-5 5M20 7l-5 5 5 5"/>
                </svg>
                Phòng lạnh
              </span>
            </div>
          </div>

          <div class="flex gap-2" v-if="activeRoom.id !== null">
            <button @click="handleOpenRoomModal(true)" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Sửa phòng">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
            </button>
            <button @click="deleteRoom" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Xóa phòng">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-6 mb-6 text-sm font-medium text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100 w-max">
          <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> Trống</div>
          <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse"></span> Đang dùng</div>
          <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span> Đã đặt</div>
        </div>

        <div v-if="currentRoomTables.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div
            v-for="table in currentRoomTables"
            :key="table.id"
            @click="selectedTable = table"
            class="group p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative border flex flex-col justify-between min-h-[120px]"
            :class="getStatusConfig(table.status).cardClass"
          >
            <div class="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
              <button @click.stop="handleOpenTableModal(true, table)" class="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-md border border-blue-100 transition-colors" title="Sửa bàn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
              </button>
              <button @click.stop="deleteTable(table.id)" class="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md border border-red-100 transition-colors" title="Xóa bàn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div class="flex items-center gap-1.5 mb-2">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full rounded-full opacity-75" :class="getStatusConfig(table.status).pingClass"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm" :class="getStatusConfig(table.status).dotClass"></span>
              </span>
              <span class="text-[10px] font-bold uppercase tracking-widest" :class="getStatusConfig(table.status).textClass">
                {{ getStatusLabel(table.status) }}
              </span>
            </div>

            <div class="text-left font-black text-2xl text-gray-800 tracking-tight leading-tight my-1">{{ table.name }}</div>

            <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 opacity-70"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654z" /></svg>
              {{ table.capacity }} ghế
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-300 mx-auto mb-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
          <p class="text-gray-500 font-medium">Chưa có bàn nào trong khu vực này.</p>
          <button @click="handleOpenTableModal(false)" class="text-green-600 text-sm font-bold mt-2 hover:underline">Thêm bàn ngay</button>
        </div>
      </div>
    </div>

    <RoomFormModal :show="showRoomModal" :isEdit="isEditRoom" :initialData="currentRoomData" @close="showRoomModal = false" @submit="submitRoom" />
    <ShopTableFormModal :show="showTableModal" :isEdit="isEditTable" :initialData="currentTableData" :rooms="roomStore.adminRooms" @close="showTableModal = false" @submit="submitTable" />
  </div>
</template>