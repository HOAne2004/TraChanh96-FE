<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/category'
import { useProductStore } from '@/stores/product'

import OptionsFormModal from '../options/OptionsFormModal.vue'
import CategorySelectInput from '@/components/admin/categories/CategorySelectInput.vue'
import uploadApi from '@/services/upload.service'
import { formatPrice, parsePrice } from '@/utils/formatters'

/* --------------------------------------
   PROPS & EMITS
----------------------------------------- */
const props = defineProps({
  product: { type: Object, default: null },
  isOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'open-option-modal'])
/* --------------------------------------
   STORE
----------------------------------------- */
const categoryStore = useCategoryStore()
const { categoryTree } = storeToRefs(categoryStore)

const productStore = useProductStore()
const { sizes, sugarLevels, iceLevels } = storeToRefs(productStore)

/* --------------------------------------
   FORM DATA
----------------------------------------- */
const isUploading = ref(false)

const formData = reactive({
  name: '',
  basePrice: 0,
  description: '',
  imageUrl: '',
  ingredient: '',
  productType: 'Beverage',
  status: 'Active',

  categoryId: null,

  sizeIds: [],
  iceLevelIds: [],
  sugarLevelIds: [],
})

/* --------------------------------------
   MODE
----------------------------------------- */
const isEditMode = computed(() => !!props.product)
const modalTitle = computed(() => (isEditMode.value ? 'Chỉnh sửa Sản phẩm' : 'Tạo Sản phẩm mới'))

/* --------------------------------------
   SYNC PROPS → FORM
----------------------------------------- */
watch(
  () => props.product,
  (p) => {
    if (!p) {
      Object.assign(formData, {
        name: '',
        basePrice: 0,
        categoryId: null,
        sizeIds: [],
        iceLevelIds: [],
        sugarLevelIds: [],
        productType: 'Beverage',
        status: 'Active',
      })
      return
    }

    formData.name = p.name
    formData.basePrice = p.basePrice
    formData.description = p.description ?? ''
    formData.imageUrl = p.imageUrl ?? ''
    formData.ingredient = p.ingredient ?? ''
    formData.productType = p.productType
    formData.status = p.status
    formData.categoryId = p.categoryId

    formData.sizeIds = p.allowedSizeIds || []
    formData.iceLevelIds = p.allowedIceLevelIds || []
    formData.sugarLevelIds = p.allowedSugarLevelIds || []
  },
  { immediate: true },
)

/* --------------------------------------
   FORMAT PRICE (v-model)
----------------------------------------- */
const formattedPrice = computed({
  get() {
    return formatPrice(formData.basePrice)
  },
  set(val) {
    formData.basePrice = parsePrice(val)
  },
})

/* --------------------------------------
   SUBMIT FORM (Đã chỉnh sửa cho khớp DTO)
----------------------------------------- */
const handleSubmit = async () => {
  // 1. Chuẩn bị payload khớp với ProductCreateDto.cs
  // JSON Serializer của .NET tự động map camelCase (JS) -> PascalCase (C#)
  // Ví dụ: sizeIds (JS) -> SizeIds (C#) -> OK!
  const payload = {
    name: formData.name,
    basePrice: formData.basePrice,
    categoryId: formData.categoryId,
    // imageUrl lấy từ kết quả upload trước đó (đường dẫn tương đối)
    imageUrl: formData.imageUrl,
    description: formData.description,
    productType: formData.productType,
    status: formData.status,
    ingredient: formData.ingredient,

    // Mapping mảng IDs
    sizeIds: formData.sizeIds,
    iceLevelIds: formData.iceLevelIds,
    sugarLevelIds: formData.sugarLevelIds,
  }

  try {
    if (isEditMode.value) {
      await productStore.updateProductAction(props.product.id, payload)
    } else {
      await productStore.createProductAction(payload)
    }
    emit('close')
  } catch (err) {
    console.error('Lỗi submit form:', err)
    // Toast lỗi đã được xử lý trong store, không cần gọi lại ở đây
  }
}

/* --------------------------------------
   LOGIC OPTIONS MODAL (MỚI)
----------------------------------------- */
const isOptionModalOpen = ref(false)
const currentOptionType = ref('size')

const openOptionModal = (type) => {
  currentOptionType.value = type
  isOptionModalOpen.value = true
}

// Callback khi tạo xong Option -> Tự động tick chọn vào form
const handleOptionCreated = ({ type, data }) => {
  productStore.modalStore?.showToast(`Đã thêm ${data.label}`, 'success')

  // Tự động push ID vừa tạo vào mảng đang chọn
  if (type === 'size') {
    formData.sizeIds.push(data.id)
  } else if (type === 'sugar') {
    formData.sugarLevelIds.push(data.id)
  } else if (type === 'ice') {
    formData.iceLevelIds.push(data.id)
  }
}
/* --------------------------------------
   LOAD DATA WHEN OPEN
----------------------------------------- */
onMounted(() => {
  categoryStore.fetchCategories()
  productStore.fetchProduct()
})

/* --------------------------------------
    UTILITY: Toggle item in array (Cho Size/Sugar/Ice)
----------------------------------------- */
const toggleItem = (array, itemId) => {
  // Ép itemId về kiểu Number nếu nó là chuỗi (đảm bảo so sánh đúng)
  const id = Number(itemId)
  const index = array.indexOf(id)

  if (index > -1) {
    // Xóa khỏi mảng nếu đã tồn tại
    array.splice(index, 1)
  } else {
    // Thêm vào mảng nếu chưa tồn tại
    array.push(id)
  }
}
/* --------------------------------------
    ACTION: Open dedicated Option Modal
----------------------------------------- */

/* --------------------------------------
    IMAGE UPLOAD
----------------------------------------- */

const fileInputRef = ref(null)

// ⭐️ ACTION: Hàm kích hoạt input (Dùng cho nút)
const triggerFileInput = () => {
  // Đảm bảo click được gọi trên ref
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// Thêm một ref riêng để lưu ảnh preview
const previewImage = ref(null)

// Cập nhật logic hiển thị ảnh
const displayImage = computed(() => {
  // 1. Nếu đang có ảnh preview (vừa chọn/chụp) -> Ưu tiên hiển thị
  if (previewImage.value) return previewImage.value

  // 2. Nếu không, lấy ảnh từ dữ liệu form (ảnh cũ từ server)
  const url = formData.imageUrl
  if (!url) return ''

  if (url.startsWith('http')) return url
  return `https://trachanh96-be-production.up.railway.app${url}`
})

// Hàm xử lý khi chọn file
const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 1. Tạo link ảo để hiện ngay lập tức (User thấy nhanh)
  previewImage.value = URL.createObjectURL(file)

  isUploading.value = true
  try {
    // 2. Upload ngầm lên server
    const publicUrl = await uploadApi.uploadImage(file)
    formData.imageUrl = publicUrl // Lưu đường dẫn thật vào form để gửi đi

    productStore.modalStore?.showToast('Tải ảnh thành công!', 'success')
  } catch (err) {
    productStore.modalStore?.showToast('Tải ảnh thất bại.', 'error')
    previewImage.value = null // Reset nếu lỗi
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = null
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    @click.self="emit('close')"
    class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
  >
    <div class="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ modalTitle }}
        </h2>
        <button
          @click="emit('close')"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="space-y-4">
              <div>
                <label class="font-medium text-sm">Tên sản phẩm</label>
                <input
                  v-model="formData.name"
                  required
                  class="mt-1 w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="font-medium text-sm">Danh mục</label>
                  <CategorySelectInput
                    v-model:selected-id="formData.categoryId"
                    :category-tree="categoryTree"
                    placeholder="Chọn danh mục"
                    class="mt-1"
                  />
                </div>
                <div>
                  <label class="font-medium text-sm">Loại sản phẩm</label>
                  <select
                    v-model="formData.productType"
                    required
                    class="mt-1 w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
                  >
                    <option value="Beverage">Đồ uống</option>
                    <option value="Topping">Topping</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="font-medium text-sm">Mô tả</label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  class="mt-1 w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label class="font-medium text-sm">Thành phần</label>
                <textarea
                  v-model="formData.ingredient"
                  rows="2"
                  class="mt-1 w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="font-medium text-sm">Giá gốc</label>
                <input
                  v-model="formattedPrice"
                  required
                  class="mt-1 w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div
                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 space-y-2"
              >
                <label class="font-medium text-sm">Ảnh Sản phẩm</label>
                <div
                  class="mt-1 w-full h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden mb-2"
                >
                  <img
                    v-if="formData.imageUrl"
                    :src="displayImage"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-gray-400">Tải ảnh lên</span>
                </div>
                <div class="md:col-span-2 flex items-center">
                  <button
                    type="button"
                    @click="triggerFileInput"
                    :disabled="isUploading"
                    class="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Chọn ảnh
                  </button>

                  <input
                    type="file"
                    ref="fileInputRef"
                    class="hidden"
                    @change="handleFileUpload"
                    accept="image/*"
                  />

                  <span v-if="isUploading" class="ml-3 text-green-600 text-sm">
                    Đang tải ảnh...
                  </span>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-medium text-sm">Size áp dụng</label>
                  <button
                    type="button"
                    @click.prevent="openOptionModal('size')"
                    class="text-green-600 hover:text-green-800 text-xs font-semibold"
                  >
                    + Thêm Size
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in sizes"
                    :key="s.id"
                    @click.prevent="toggleItem(formData.sizeIds, s.id)"
                    :class="[
                      'px-3 py-1 rounded-full border text-sm transition',
                      formData.sizeIds.includes(s.id)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                    ]"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-medium text-sm">Đường áp dụng</label>
                  <button
                    type="button"
                    @click.prevent="openOptionModal('sugar')"
                    class="text-green-600 hover:text-green-800 text-xs font-semibold"
                  >
                    + Thêm Đường
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in sugarLevels"
                    :key="s.id"
                    @click.prevent="toggleItem(formData.sugarLevelIds, s.id)"
                    :class="[
                      'px-3 py-1 rounded-full border text-sm transition',
                      formData.sugarLevelIds.includes(s.id)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                    ]"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-medium text-sm">Đá áp dụng</label>
                  <button
                    type="button"
                    @click.prevent="openOptionModal('ice')"
                    class="text-green-600 hover:text-green-800 text-xs font-semibold"
                  >
                    + Thêm Đá
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="i in iceLevels"
                    :key="i.id"
                    @click.prevent="toggleItem(formData.iceLevelIds, i.id)"
                    :class="[
                      'px-3 py-1 rounded-full border text-sm transition',
                      formData.iceLevelIds.includes(i.id)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                    ]"
                  >
                    {{ i.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end px-6 py-4 border-t dark:border-gray-700 space-x-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Hủy
          </button>

          <button
            type="submit"
            class="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {{ isEditMode ? 'Lưu thay đổi' : 'Tạo mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <OptionsFormModal
    v-if="isOptionModalOpen"
    :is-open="isOptionModalOpen"
    :type="currentOptionType"
    @close="isOptionModalOpen = false"
    @created="handleOptionCreated"
  />
</template>
