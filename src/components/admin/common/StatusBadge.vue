<script setup>
import { computed } from 'vue'

// Nhận prop status (string hoặc number)
const props = defineProps({
  status: {
    type: [String, Number],
    required: true,
  }
})

// Tạo một map các trạng thái đến với màu sắc và tên nhãn
const statusMap = {
  active:     { label: 'Hoạt động', color: 'green' },
  inactive:   { label: 'Không hoạt động', color: 'gray' },
  pending:    { label: 'Chờ duyệt', color: 'yellow' },
  completed:  { label: 'Hoàn tất', color: 'blue' },
  banned:     { label: 'Cấm', color: 'red' },
  deleted:    { label: 'Đã xóa', color: 'red' },
  locked:     { label: 'Đã khóa', color: 'red' },
  cancelled:  { label: 'Hủy', color: 'red' },
  // Bạn có thể bổ sung thêm trạng thái tại đây
  true:       { label: 'Bật', color: 'green' },
  false:      { label: 'Tắt', color: 'gray' },
  1:          { label: 'Bật', color: 'green' },
  0:          { label: 'Tắt', color: 'gray' },
}

// Chuẩn hóa trạng thái (lowercase, string hóa)
const normalizedStatus = computed(() => {
  const s = typeof props.status === 'string'
    ? props.status.toLowerCase().trim()
    : String(props.status)
  return s
})

// Tính toán nhãn và màu sắc dựa trên status
const badgeInfo = computed(() => {
  return statusMap[normalizedStatus.value] || 
         { label: props.status, color: 'gray' }
})

// Định nghĩa màu nền và chữ dựa trên màu
const badgeClass = computed(() => {
  switch (badgeInfo.value.color) {
    case 'green':  return 'bg-green-100 text-green-800'
    case 'yellow': return 'bg-yellow-100 text-yellow-800'
    case 'blue':   return 'bg-blue-100 text-blue-800'
    case 'red':    return 'bg-red-100 text-red-800'
    case 'gray':
    default:       return 'bg-gray-100 text-gray-800'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    {{ badgeInfo.label }}
  </span>
</template>
