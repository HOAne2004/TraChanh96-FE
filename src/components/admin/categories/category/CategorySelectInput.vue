<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  // V-Model: ID danh mục cha được chọn
  selectedId: {
    type: [Number, null],
    default: null,
  },
  // Dữ liệu cây categories từ store (categoryStore.categoryTree)
  categoryTree: {
    type: Array,
    required: true,
  },
  label: String,
  placeholder: String,
  // ID của danh mục hiện tại (dùng khi EDIT để không chọn chính nó hoặc con cháu nó)
  currentCategoryId: {
    type: [Number, null],
    default: null,
  }
})

const emit = defineEmits(['update:selectedId'])
const selectRef = ref(null)

// ⭐️ Logic quan trọng: Làm phẳng cây và thêm dấu gạch ngang (dễ hiển thị trong <select>)
const flattenedOptions = ref([])

const flattenTree = (nodes, level = 0) => {
  let list = []
  nodes.forEach(node => {
    // Ngăn không cho chọn chính danh mục đang sửa hoặc con cháu nó làm cha
    if (node.id !== props.currentCategoryId) {
      list.push({
        id: node.id,
        name: '—'.repeat(level) + ' ' + node.name,
      })
    }
    // Đệ quy
    if (node.children && node.children.length) {
      list = list.concat(flattenTree(node.children, level + 1))
    }
  })
  return list
}

watch(() => props.categoryTree, (newTree) => {
  if (newTree.length) {
    // Bắt đầu làm phẳng từ level 0
    flattenedOptions.value = [{ id: null, name: props.placeholder || '— Không chọn (Là danh mục gốc) —' }]
    flattenedOptions.value = flattenedOptions.value.concat(flattenTree(newTree, 0))
  }
}, { immediate: true })


// Xử lý sự kiện thay đổi
const handleChange = (e) => {
  // Đảm bảo giá trị là số hoặc null
  const value = e.target.value === '' ? null : Number(e.target.value)
  emit('update:selectedId', value)
}

</script>

<template>
  <div>
    <label v-if="label" :for="label" class="block text-sm font-medium">{{ label }}</label>
    <select
      :id="label"
      :value="selectedId"
      @change="handleChange"
      class="w-full z-50 mt-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100"
      ref="selectRef"
    >
      <option
        v-for="option in flattenedOptions" 
        :key="option.id" 
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
  </div>
</template>