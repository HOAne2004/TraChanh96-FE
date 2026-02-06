<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

// Stores
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useSizeStore } from '@/stores/size'
import { useUploadStore } from '@/stores/upload'

// Utils
import {
  canHaveTopping,
  getProductStatusOptions,
  getProductTypeOptions,
  PRODUCT_STATUS,
} from '@/constants/product.constants'

// Components
import AdminProductPreview from '@/components/admin/catalog/product/AdminProductPreview.vue'
import AdminProductForm from '@/components/admin/catalog/product/AdminProductForm.vue'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const uploadStore = useUploadStore()

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const sizeStore = useSizeStore()
const { sizes } = storeToRefs(sizeStore)

// --- STATE ---
const isEditMode = computed(() => !!route.params.id)
const isLoading = ref(false)
const allToppings = ref([]) // Danh sách topping để truyền vào form

// Dữ liệu Form
const formData = reactive({
  name: '',
  slug: '',
  categoryId: '',
  productType: 'Drink',
  basePrice: 0,
  description: '',
  ingredient: '',
  status: PRODUCT_STATUS.ACTIVE,
  imageUrl: '',
  productSizes: [],
  allowedToppingIds: [], // 🟢 Mảng chứa ID topping được chọn
})

// Logic hiển thị Topping dựa trên Danh mục
const canShowTopping = computed(() => {
  const category = categoryStore.categories.find((c) => c.id === formData.categoryId)
  // Nếu chưa chọn danh mục -> Mặc định hiện (hoặc ẩn tùy bạn), ở đây dùng hàm check
  return category ? canHaveTopping(category.slug) : false
})

// File upload state
const imageFile = ref(null)
const imagePreview = ref('')

// --- COMPUTED PREVIEW DATA ---
const previewProduct = computed(() => {
  const category = categoryStore.categories.find((c) => c.id === formData.categoryId)
  const displayImage = imagePreview.value || formData.imageUrl || ''

  return {
    id: isEditMode.value ? Number(route.params.id) : 9999,
    name: formData.name || 'Tên sản phẩm...',
    slug: formData.slug || 'slug-san-pham',
    basePrice: Number(formData.basePrice) || 0,
    displayPrice: Number(formData.basePrice) || 0,
    imageUrl: displayImage,
    totalRating: 5.0,
    totalSold: 0,
    status: formData.status,
    productType: formData.productType,
    categoryName: category ? category.name : 'Danh mục',
    description: formData.description,
    ingredient: formData.ingredient,

    // Map sizes cho preview
    availableSizes: formData.productSizes.map((ps) => {
      const sizeInfo = sizes.value.find((s) => s.id === ps.sizeId)
      return {
        id: ps.sizeId,
        name: sizeInfo?.label || 'Size?',
        priceOverride: ps.priceOverride ? Number(ps.priceOverride) : null,
        priceModifier: 0, // Demo placeholder
      }
    }),

    // Truyền list topping ids để preview hiển thị số lượng
    allowedToppingIds: formData.allowedToppingIds,

    storeIds: [],
    isSoldOut: false,
  }
})

// --- METHODS ---

const initData = async () => {
  isLoading.value = true
  try {
    // Gọi song song các API cần thiết
    const [toppingRes] = await Promise.all([
      // 1. Lấy Toppings (dùng API get products type=Topping)
      productStore.fetchProducts({ type: 'TOPPING', pageSize: 100 }),
      // 2. Lấy Categories & Sizes
      categoryStore.fetchCategories(),
      sizeStore.fetchAdminSizes ? sizeStore.fetchAdminSizes() : sizeStore.fetchSizes(),
    ])

    allToppings.value = toppingRes?.items || [] // Gán danh sách topping

    // Edit Mode logic
    if (isEditMode.value) {
      const productId = route.params.id
      await productStore.fetchProductById(productId)
      const p = productStore.currentProduct
      if (p) {
        Object.assign(formData, {
          name: p.name,
          slug: p.slug,
          categoryId: p.categoryId,
          productType: p.productType,
          basePrice: p.basePrice,
          description: p.description,
          ingredient: p.ingredient,
          status: p.status,
          imageUrl: p.imageUrl,
          // Map Sizes
          productSizes: (p.productSizes || []).map((ps) => ({
            sizeId: ps.sizeId || ps.size?.id,
            priceOverride: ps.priceOverride,
          })),
          // Map Toppings (Nếu Backend đã trả về list allowedToppingIds)
          allowedToppingIds: p.allowedToppingIds || [],
        })
        imagePreview.value = p.imageUrl
      }
    }
  } catch (err) {
    console.error(err)
    toastStore.show({ type: 'error', message: 'Lỗi tải dữ liệu' })
  } finally {
    isLoading.value = false
  }
}

// Handlers
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleUrlInput = () => {
  imageFile.value = null
  imagePreview.value = formData.imageUrl
}

const generateSlug = () => {
  if (!formData.name) return
  formData.slug = formData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/^-+|-+$/g, '')
}

const handleSubmit = async () => {
  if (!formData.name || !formData.basePrice)
    return toastStore.show({ type: 'warning', message: 'Vui lòng nhập tên và giá cơ bản' })

  isLoading.value = true
  try {
    if (imageFile.value) {
      try {
        const uploadedUrl = await uploadStore.uploadFileAction(imageFile.value)
        formData.imageUrl = uploadedUrl
      } catch (e) {
        /* ignore */
      }
    }

    const payload = { ...formData }
    payload.basePrice = Number(payload.basePrice)

    // Map sizes: Xử lý giá 0/null
    payload.productSizes = payload.productSizes
      .map((s) => ({
        sizeId: Number(s.sizeId),
        priceOverride:
          s.priceOverride && Number(s.priceOverride) > 0 ? Number(s.priceOverride) : null,
      }))
      .filter((s) => s.sizeId)

    // Lưu ý: Đảm bảo payload gửi lên có allowedToppingIds
    // payload.allowedToppingIds là mảng [1, 2, 5]

    if (isEditMode.value) {
      await productStore.updateProduct(route.params.id, payload)
    } else {
      await productStore.createProduct(payload)
    }
    router.push({ name: 'admin.products' })
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}
          </h1>
          <p class="text-sm text-gray-500">Điền thông tin chi tiết sản phẩm</p>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          @click="router.back()"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
        >
          Hủy
        </button>
        <button
          @click="handleSubmit"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm shadow-lg shadow-green-200"
        >
          {{ isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-500 mt-2 text-sm">Đang tải dữ liệu...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <AdminProductForm
          v-model="formData"
          :categories="categoryStore.categories"
          :sizes="sizes"
          :toppings="allToppings"
          :type-options="getProductTypeOptions()"
          :status-options="getProductStatusOptions(false)"
          :can-show-topping="canShowTopping"
          @file-change="handleFileChange"
          @url-input="handleUrlInput"
          @blur-name="generateSlug"
        />
      </div>

      <div class="lg:col-span-2">
        <AdminProductPreview
          :preview-product="previewProduct"
          :show-topping-info="canShowTopping"
        />
      </div>
    </div>
  </div>
</template>
