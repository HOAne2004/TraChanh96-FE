<script setup>
import { computed, watch, ref } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import AIGenerateButton from '@/components/assistant/AIGenerateButton.vue'
import { marked } from 'marked'
import { getIceOptions, getSugarOptions, SUGAR_LEVEL_UI, ICE_LEVEL_UI  } from '@/constants/option.constants'

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  sizes: { type: Array, default: () => [] },
  toppings: { type: Array, default: () => [] }, 
  typeOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  canShowTopping: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'file-change', 'url-input', 'blur-name'])

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Logic Size
const usedSizeIds = computed(() => formData.value.productSizes?.map((i) => i.sizeId) || [])
const canAddMoreSize = computed(() => (formData.value.productSizes?.length || 0) < props.sizes.length)

const addSize = () => {
  if (canAddMoreSize.value) {
    if(!formData.value.productSizes) formData.value.productSizes = []
    formData.value.productSizes.push({ sizeId: '', priceOverride: '' })
  }
}
const removeSize = (index) => formData.value.productSizes.splice(index, 1)

// Logic Image
const onFileChange = (e) => emit('file-change', e)
const onUrlInput = () => emit('url-input')

// Hàm xử lý cho Mô tả
const applyAIToDescription = (aiContentText) => {
  const htmlContent = marked.parse(aiContentText);
  formData.value.description = htmlContent;
}

const applyAIToIngredient = (aiContentText) => {
  const htmlContent = marked.parse(aiContentText);
  formData.value.ingredient = htmlContent;
}

const getDefaultSizePrice = (sizeId) => {
  if (!sizeId) return 'Ghi đè giá'
  const sizeObj = props.sizes.find(s => s.id === sizeId)
  const modifier = sizeObj ? Number(sizeObj.priceModifier || 0) : 0
  const base = Number(formData.value.basePrice || 0)
  return `Mặc định: ${formatPrice(base + modifier)}`
}

// ========================================================
// LOGIC CHUẨN HOÁ DỮ LIỆU TỪ API (ĐÃ FIX TYPE MISMATCH)
// ========================================================

const sugarOptionsList = getSugarOptions()
const iceOptionsList = getIceOptions()

// 1. Bộ dịch Chuỗi Enum của C# sang Số nguyên của UI (Tái sử dụng Constants)
const parseSugarValue = (val) => {
  if (typeof val === 'number') return val;
  // val từ C# là "S30", toLowerCase thành "s30", tìm trong SUGAR_LEVEL_UI sẽ ra object có value = 30
  const key = String(val).toLowerCase(); 
  return SUGAR_LEVEL_UI[key]?.value || null;
}

const parseIceValue = (val) => {
  if (typeof val === 'number') return val;
  // val từ C# là "None", toLowerCase thành "none", tìm trong ICE_LEVEL_UI sẽ ra object có value = 1
  const key = String(val).toLowerCase(); 
  return ICE_LEVEL_UI[key]?.value || null;
}

// 2. Deep Watcher xử lý ngay khi có Data từ BE trả về
watch(
  () => formData.value,
  (val) => {
    if (val) {
      // Xử lý Đường
      const currentSugar = val.allowedSugarLevels || []
      const mappedSugar = currentSugar.map(parseSugarValue).filter(n => n !== null)
      // So sánh để tránh lặp vô hạn (Infinite Loop)
      if (JSON.stringify(currentSugar) !== JSON.stringify(mappedSugar)) {
        val.allowedSugarLevels = mappedSugar
      }

      // Xử lý Đá
      const currentIce = val.allowedIceLevels || []
      const mappedIce = currentIce.map(parseIceValue).filter(n => n !== null)
      if (JSON.stringify(currentIce) !== JSON.stringify(mappedIce)) {
        val.allowedIceLevels = mappedIce
      }

      // Xử lý Topping (Topping ID vốn là số, chỉ cần ép kiểu Number)
      const currentTopping = val.allowedToppingIds || []
      const mappedTopping = currentTopping.map(Number).filter(n => !isNaN(n))
      if (JSON.stringify(currentTopping) !== JSON.stringify(mappedTopping)) {
        val.allowedToppingIds = mappedTopping
      }
    }
  },
  { immediate: true, deep: true }
)

// 3. Computed cho Checkbox "Chọn tất cả" (Tác động thẳng vào formData)
const isAllSugarSelected = computed({
  get: () => sugarOptionsList.length > 0 && formData.value.allowedSugarLevels?.length === sugarOptionsList.length,
  set: (val) => { formData.value.allowedSugarLevels = val ? sugarOptionsList.map(o => o.value) : [] }
})

const isAllIceSelected = computed({
  get: () => iceOptionsList.length > 0 && formData.value.allowedIceLevels?.length === iceOptionsList.length,
  set: (val) => { formData.value.allowedIceLevels = val ? iceOptionsList.map(o => o.value) : [] }
})

const isAllToppingSelected = computed({
  get: () => props.toppings.length > 0 && formData.value.allowedToppingIds?.length === props.toppings.length,
  set: (val) => { formData.value.allowedToppingIds = val ? props.toppings.map(t => t.id) : [] }
})

// --- LOGIC PHÂN LOẠI HIỂN THỊ ---
const isDrink = computed(() => formData.value.productType === 'Drink')
watch(() => formData.value.productType, (newType) => {
  if (newType !== 'Drink') {
    formData.value.allowedSugarLevels = []
    formData.value.allowedIceLevels = []
    formData.value.allowedToppingIds = []
    formData.value.productSizes = []
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 class="text-base font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cơ bản</h3>
      <div class="space-y-4">
        <div>
          <label class="form-label">Tên sản phẩm <span class="text-red-500">*</span></label>
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
            <label class="form-label">Danh mục <span class="text-red-500">*</span></label>
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
        <label class="form-label">Giá cơ bản (VNĐ) <span class="text-red-500">*</span></label>
        <input
          v-model="formData.basePrice"
          type="number"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
          placeholder="0"
        />
      </div>

      <div v-if="isDrink" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Cấu hình Size</label>
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
            class="w-32 px-2 py-1.5 text-xs rounded border border-gray-300 outline-none text-right"
            :placeholder="getDefaultSizePrice(item.sizeId)"
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
    
  <div v-if="isDrink" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-6">
      <h3 class="text-base font-bold text-gray-800 border-b pb-2">Tùy chọn bổ sung</h3>

      <div>
        <div class="flex justify-between items-center mb-3">
          <label class="font-medium text-sm text-gray-700">Mức đường cho phép</label>
          <label class="flex items-center gap-2 text-xs text-green-600 cursor-pointer font-medium hover:bg-green-50 px-2 py-1 rounded">
            <input type="checkbox" v-model="isAllSugarSelected" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            Chọn tất cả
          </label>
        </div>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in getSugarOptions()" :key="opt.value"
            class="flex items-center gap-2 p-2 border rounded cursor-pointer select-none text-xs transition-colors"
            :class="formData.allowedSugarLevels.includes(opt.value) ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 hover:bg-gray-50'"
          >
            <input type="checkbox" v-model="formData.allowedSugarLevels" :value="opt.value" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            {{ opt.fullLabel }}
          </label>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <label class="font-medium text-sm text-gray-700">Mức đá cho phép</label>
          <label class="flex items-center gap-2 text-xs text-green-600 cursor-pointer font-medium hover:bg-green-50 px-2 py-1 rounded">
            <input type="checkbox" v-model="isAllIceSelected" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            Chọn tất cả
          </label>
        </div>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in getIceOptions()" :key="opt.value"
            class="flex items-center gap-2 p-2 border rounded cursor-pointer select-none text-xs transition-colors"
            :class="formData.allowedIceLevels.includes(opt.value) ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 hover:bg-gray-50'"
          >
            <input type="checkbox" v-model="formData.allowedIceLevels" :value="opt.value" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            {{ opt.fullLabel }}
          </label>
        </div>
      </div>

      <div v-if="canShowTopping" class="pt-4 border-t border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <label class="font-medium text-sm text-gray-700">Topping đi kèm</label>
          <label v-if="toppings.length > 0" class="flex items-center gap-2 text-xs text-green-600 cursor-pointer font-medium hover:bg-green-50 px-2 py-1 rounded">
            <input type="checkbox" v-model="isAllToppingSelected" class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
            Chọn tất cả ({{ toppings.length }})
          </label>
        </div>
        
        <div v-if="toppings.length > 0" class="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          <label
            v-for="t in toppings" :key="t.id"
            class="flex items-center gap-2 p-2 border rounded cursor-pointer select-none text-xs transition-colors"
            :class="formData.allowedToppingIds.includes(t.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'"
          >
            <input type="checkbox" v-model="formData.allowedToppingIds" :value="t.id" class="w-4 h-4 text-green-600 rounded focus:ring-green-500 shrink-0" />
            <div class="flex-1 truncate">
              <div class="font-medium truncate" :class="formData.allowedToppingIds.includes(t.id) ? 'text-green-700' : 'text-gray-700'">{{ t.name }}</div>
              <div class="text-gray-500">{{ formatPrice(t.basePrice) }}đ</div>
            </div>
          </label>
        </div>
        <div v-else class="text-sm text-gray-400 italic py-2">Chưa có topping nào trong hệ thống.</div>
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
          <div class="flex justify-between items-center mb-1">
             <label class="form-label mb-0">Mô tả</label>
             <AIGenerateButton contentType="product" @generated="applyAIToDescription" />
          </div>          <div class="form_textarea">
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
            <div class="flex justify-between items-center mb-1">
             <label class="form-label mb-0">Thành phần</label>
             <AIGenerateButton contentType="product_ingredient" @generated="applyAIToIngredient" />
           </div>          <div class="form_textarea">
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
.form_label {
  @apply block text-xs font-medium text-gray-700 mb-1;
}
.form_textarea {
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
