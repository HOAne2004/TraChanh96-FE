<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: [Date, String, Object], // Thời gian pickup
  store: Object,
})

const emit = defineEmits(['update:modelValue'])

// Options: Hôm nay, Ngày mai
const dateOption = ref('today') // 'today' | 'tomorrow'
const timeOption = ref('') // 'HH:mm'

// 1. Tạo danh sách giờ (Slots) dựa trên OpenTime - CloseTime
const timeSlots = computed(() => {
  if (!props.store?.openTime || !props.store?.closeTime) return []

  const [openH, openM] = props.store.openTime.split(':').map(Number)
  const [closeH, closeM] = props.store.closeTime.split(':').map(Number)

  const slots = []
  let start = openH * 60 + openM
  let end = closeH * 60 + closeM

  // Nếu là hôm nay, start phải > giờ hiện tại + 30 phút (chuẩn bị)
  if (dateOption.value === 'today') {
    const now = new Date()
    const currentMin = now.getHours() * 60 + now.getMinutes() + 30
    if (currentMin > start) start = Math.ceil(currentMin / 30) * 30 // Làm tròn lên 30p
  }

  for (let min = start; min < end; min += 30) {
    const h = Math.floor(min / 60)
    const m = min % 60
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    slots.push(timeStr)
  }

  return slots
})

// 2. Watch để emit giá trị chuẩn ISO ra ngoài
watch([dateOption, timeOption], ([d, t]) => {
  if (!t) {
    emit('update:modelValue', null)
    return
  }

  const targetDate = new Date()
  if (d === 'tomorrow') {
    targetDate.setDate(targetDate.getDate() + 1)
  }

  const [h, m] = t.split(':').map(Number)
  targetDate.setHours(h, m, 0, 0)

  emit('update:modelValue', targetDate.toISOString())
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <h2 class="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 text-xl border-l-4 border-green-500 pl-2">
      Thời gian đến lấy
    </h2>

    <div v-if="store" class="mb-4 text-sm text-gray-500 bg-gray-50 p-2 rounded">
      Giờ mở cửa: <span class="font-bold">{{ store.openTime }} - {{ store.closeTime }}</span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1">Ngày</label>
        <select v-model="dateOption" class="w-full border p-2 rounded-lg text-sm dark:bg-gray-700">
          <option value="today">Hôm nay</option>
          <option value="tomorrow">Ngày mai</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-500 mb-1">Giờ (cách mỗi 30p)</label>
        <select v-model="timeOption" class="w-full border p-2 rounded-lg text-sm dark:bg-gray-700">
          <option value="" disabled>-- Chọn giờ --</option>
          <option v-for="slot in timeSlots" :key="slot" :value="slot">
            {{ slot }}
          </option>
        </select>
      </div>
    </div>

    <p v-if="timeSlots.length === 0" class="text-xs text-red-500 mt-2">
      Hôm nay cửa hàng đã đóng cửa hoặc sắp đóng cửa. Vui lòng chọn ngày mai.
    </p>
  </div>
</template>
