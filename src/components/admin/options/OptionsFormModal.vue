<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useProductStore } from '@/stores/product'

const props = defineProps({
  isOpen: Boolean,
  type: String, // 'size', 'sugar', 'ice'
  itemData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'created', 'updated'])
const productStore = useProductStore()

// Refs cho input để xử lý focus
const labelInput = ref(null)
const valueInput = ref(null)

const isLoading = ref(false)
const label = ref('')
const valueData = ref(0)

const isEditMode = computed(() => !!props.itemData)

const title = computed(() => {
  const action = isEditMode.value ? 'Cập nhật' : 'Thêm mới'
  if (props.type === 'size') return `${action} Kích cỡ (Size)`
  if (props.type === 'sugar') return `${action} Mức Đường`
  return `${action} Mức Đá`
})

const valueLabel = computed(() => {
  if (props.type === 'size') return 'Giá thêm (VNĐ)'
  return 'Giá trị (%)'
})

// Đồng bộ dữ liệu khi mở modal
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Reset hoặc Fill data
      if (props.itemData) {
        label.value = props.itemData.label
        valueData.value =
          props.type === 'size' ? props.itemData.priceModifier : props.itemData.value
      } else {
        label.value = ''
        valueData.value = 0
      }
      // Focus vào ô đầu tiên khi mở modal
      nextTick(() => labelInput.value?.focus())
    }
  },
)

// ⭐️ XỬ LÝ ENTER: Chuyển focus xuống ô dưới
const focusNextInput = () => {
  valueInput.value?.focus()
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    const numberValue = Number(valueData.value)
    // Validate cơ bản
    if (props.type !== 'size' && (numberValue < 0 || numberValue > 100)) {
      alert('Giá trị % phải từ 0 đến 100')
      isLoading.value = false
      return
    }

    let result = null
    const id = props.itemData?.id // Lấy ID nếu đang sửa

    // 1. LOGIC SIZE
    if (props.type === 'size') {
      const payload = { label: label.value, priceModifier: numberValue }
      if (isEditMode.value) result = await productStore.updateSizeAction(id, payload)
      else result = await productStore.createSizeAction(payload)
    }
    // 2. LOGIC SUGAR
    else if (props.type === 'sugar') {
      const payload = { label: label.value, value: numberValue }
      if (isEditMode.value) result = await productStore.updateSugarLevelAction(id, payload)
      else result = await productStore.createSugarLevelAction(payload)
    }
    // 3. LOGIC ICE
    else {
      const payload = { label: label.value, value: numberValue }
      if (isEditMode.value) result = await productStore.updateIceLevelAction(id, payload)
      else result = await productStore.createIceLevelAction(payload)
    }

    // Emit event reload
    if (isEditMode.value) emit('updated', { type: props.type, data: result })
    else emit('created', { type: props.type, data: result })

    emit('close')
  } catch (err) {
    console.error(err)
    // Lỗi đã được Store hiển thị Toast
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
    <div
      class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl border dark:border-gray-700 animate-fade-in-up"
    >
      <h3 class="text-lg font-bold mb-4 dark:text-white">{{ title }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">Tên hiển thị</label>
          <input
            ref="labelInput"
            v-model="label"
            required
            placeholder="VD: Lớn, 50%..."
            class="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            @keydown.enter.prevent="focusNextInput"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-300">{{ valueLabel }}</label>
          <input
            ref="valueInput"
            v-model="valueData"
            type="number"
            required
            class="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
          >
            <span v-if="isLoading" class="mr-2">...</span>
            {{ isEditMode ? 'Lưu' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
