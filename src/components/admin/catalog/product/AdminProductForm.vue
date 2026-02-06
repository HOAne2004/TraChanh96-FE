<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: { type: Object, required: true }, // formData
  categories: { type: Array, default: () => [] },
  sizes: { type: Array, default: () => [] },
  toppings: { type: Array, default: () => [] }, // Danh sách tất cả topping
  typeOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },

  // Logic kiểm soát hiển thị
  canShowTopping: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'file-change', 'url-input', 'blur-name'])

// Proxy để update v-model
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Logic Size
const usedSizeIds = computed(() => formData.value.productSizes.map((i) => i.sizeId))
const canAddMoreSize = computed(() => formData.value.productSizes.length < props.sizes.length)

const addSize = () => {
  if (canAddMoreSize.value) formData.value.productSizes.push({ sizeId: '', priceOverride: '' })
}
const removeSize = (index) => formData.value.productSizes.splice(index, 1)

// Logic Image
const onFileChange = (e) => emit('file-change', e)
const onUrlInput = () => emit('url-input')
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 class="text-base font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cơ bản</h3>
      <div class="space-y-4">
        <div>
          <label class="form-label"
            >Tên sản phẩm <span class="text-red-500">*</span></label
          >
          <input
            v-model="formData.name"
            @blur="$emit('blur-name')"
            type="text"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Nhập tên..."
          />
        </div>
        <div>
          <label class="form-label">Slug</label>
          <input
            v-model="formData.slug"
            type="text"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 text-gray-500 outline-none"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label"
              >Danh mục <span class="text-red-500">*</span></label
            >
            <select
              v-model="formData.categoryId"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none"
            >
              <option value="" disabled>Chọn...</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Loại</label>
            <select
              v-model="formData.productType"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none"
            >
              <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Trạng thái</label>
          <select
            v-model="formData.status"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 class="text-base font-bold text-gray-800 mb-4 border-b pb-2">Giá & Kích thước</h3>
      <div class="mb-4">
        <label class="form-label"
          >Giá cơ bản (VNĐ) <span class="text-red-500">*</span></label
        >
        <input
          v-model="formData.basePrice"
          type="number"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
          placeholder="0"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-medium text-gray-700">Cấu hình Size</label>
        <div
          v-for="(item, index) in formData.productSizes"
          :key="index"
          class="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100"
        >
          <select
            v-model="item.sizeId"
            class="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 outline-none bg-white"
          >
            <option value="" disabled>Size</option>
            <option
              v-for="s in sizes"
              :key="s.id"
              :value="s.id"
              :disabled="usedSizeIds.includes(s.id) && item.sizeId !== s.id"
            >
              {{ s.label }}
              {{ usedSizeIds.includes(s.id) && item.sizeId !== s.id ? '(Đã chọn)' : '' }}
            </option>
          </select>
          <input
            v-model="item.priceOverride"
            type="number"
            class="w-24 px-2 py-1.5 text-xs rounded border border-gray-300 outline-none text-right"
            placeholder="Ghi đè giá"
          />
          <button @click="removeSize(index)" class="text-red-400 hover:text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <button
          v-if="canAddMoreSize"
          @click="addSize"
          type="button"
          class="w-full py-1.5 border border-dashed border-green-300 text-green-600 text-xs font-medium rounded hover:bg-green-50"
        >
          + Thêm kích thước
        </button>
      </div>
    </div>

    <div
      v-if="canShowTopping"
      class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all"
    >
      <h3 class="text-base font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between">
        Topping đi kèm
        <span class="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
          >Đã chọn: {{ formData.allowedToppingIds.length }}</span
        >
      </h3>

      <div
        v-if="toppings.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1"
      >
        <label
          v-for="t in toppings"
          :key="t.id"
          class="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 select-none text-xs"
          :class="
            formData.allowedToppingIds.includes(t.id)
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200'
          "
        >
          <input
            type="checkbox"
            v-model="formData.allowedToppingIds"
            :value="t.id"
            class="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <div class="flex-1 truncate">
            <div class="font-medium truncate">{{ t.name }}</div>
            <div class="text-gray-500">{{ formatPrice(t.basePrice) }}đ</div>
          </div>
        </label>
      </div>
      <div v-else class="text-sm text-gray-400 italic text-center py-2">
        Chưa có topping nào trong hệ thống.
      </div>
    </div>

    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 class="text-base font-bold text-gray-800 mb-4 border-b pb-2">Hình ảnh & Mô tả</h3>
      <div class="mb-4 space-y-3">
        <div>
          <label class="form-label">Link ảnh</label>
          <input
            v-model="formData.imageUrl"
            @input="onUrlInput"
            type="text"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none"
            placeholder="https://..."
          />
        </div>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-white px-2 text-gray-500">Hoặc tải lên</span>
          </div>
        </div>
        <input
          type="file"
          @change="onFileChange"
          accept="image/*"
          class="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
        />
      </div>
      <div class="space-y-3">
        <div>
          <label class="form-label">Mô tả</label>
          <div class="form_textarea">
            <QuillEditor
              v-model:content="formData.description"
              content-type="html"
              theme="snow"
              toolbar="essential"
              style="height: 150px"
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>
        </div>
        <div>
          <label class="form-label">Thành phần</label>
          <div class="form_textarea">
            <QuillEditor
              v-model:content="formData.ingredient"
              content-type="html"
              theme="snow"
              toolbar="essential"
              style="height: 150px"
              placeholder="Nhập thành phần..."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form_label{
  @apply block text-xs font-medium text-gray-700 mb-1;
}
.form_textarea{
  @apply bg-white rounded-lg border border-gray-300;
}
:deep(.ql-toolbar) {
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: 1px solid #e5e7eb !important;
  border-radius: 0.5rem 0.5rem 0 0;
  background-color: #f9fafb;
}
:deep(.ql-container) {
  border: none !important;
  border-radius: 0 0 0.5rem 0.5rem;
}
</style>
