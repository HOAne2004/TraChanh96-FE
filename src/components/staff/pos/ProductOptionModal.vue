<script setup>
import { ref, computed, watch } from 'vue'
import { formatPrice } from '@/utils/formatters'
import {
  ICE_LEVEL,
  SUGAR_LEVEL,
  getIceOptions,
  getSugarOptions,
} from '@/constants/option.constants'

const props = defineProps({
  isOpen: Boolean,
  product: Object, // ProductReadDto
})

const emit = defineEmits(['close', 'add-to-cart'])

// --- Options Data ---
const iceOptions = getIceOptions()
const sugarOptions = getSugarOptions()

// --- State ---
const quantity = ref(1)
const selectedSize = ref(null) // Sẽ chứa object ProductSizeReadDto
const sugarLevel = ref(SUGAR_LEVEL.S100)
const iceLevel = ref(ICE_LEVEL.I100)
const note = ref('')

// --- Helpers ---
// Sort size theo giá FinalPrice tăng dần
const sortedProductSizes = computed(() => {
  // productSizes viết thường vì JS convention (camelCase), DTO BE là PascalCase nhưng API trả về thường tự map sang camelCase
  if (!props.product?.productSizes) return []
  return [...props.product.productSizes].sort((a, b) => a.finalPrice - b.finalPrice)
})

// Reset state when product changes
watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      quantity.value = 1
      note.value = ''
      sugarLevel.value = SUGAR_LEVEL.S100
      iceLevel.value = ICE_LEVEL.I100

      // Auto select Size
      if (newVal.productSizes && newVal.productSizes.length > 0) {
        // Logic: Chọn size có giá bằng BasePrice (size gốc) hoặc size rẻ nhất
        const defaultSize = newVal.productSizes.find((s) => s.finalPrice === newVal.basePrice)
        selectedSize.value = defaultSize || sortedProductSizes.value[0]
      } else {
        selectedSize.value = null
      }
    }
  },
)

// Tính đơn giá (Unit Price) cho 1 sản phẩm
const currentUnitPrice = computed(() => {
  if (!props.product) return 0

  // Nếu đã chọn size -> Lấy FinalPrice của size đó (BE đã tính sẵn)
  if (selectedSize.value) {
    return selectedSize.value.finalPrice
  }

  // Nếu không có size (VD: Bánh ngọt) -> Lấy BasePrice
  return props.product.basePrice || 0
})

const closeModal = () => {
  emit('close')
}

const confirmAdd = () => {
  const item = {
    product: props.product,
    quantity: quantity.value,

    // Options
    options: {
      sizeId: selectedSize.value?.sizeId, // DTO: SizeId
      sizeLabel: selectedSize.value?.sizeLabel, // DTO: SizeLabel
      sugar: sugarLevel.value,
      ice: iceLevel.value,
    },
    note: note.value,

    // Lưu đơn giá cuối cùng để Store tính toán
    unitPrice: currentUnitPrice.value,
  }
  emit('add-to-cart', item)
  closeModal()
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>

    <div
      class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 class="font-bold text-lg text-gray-800">{{ product?.name }}</h3>
          <p class="text-sm text-blue-600 font-bold">{{ formatPrice(currentUnitPrice) }}</p>
        </div>
        <button @click="closeModal" class="p-2 hover:bg-gray-200 rounded-full text-gray-500">
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <div v-if="product?.productSizes?.length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Kích thước
          </h4>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="pSize in sortedProductSizes"
              :key="pSize.sizeId"
              @click="selectedSize = pSize"
              class="px-4 py-2 rounded-xl border transition-all text-sm font-medium"
              :class="
                selectedSize?.sizeId === pSize.sizeId
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              "
            >
              {{ pSize.sizeLabel }}

              <span v-if="pSize.finalPrice - product.basePrice > 0">
                (+{{ formatPrice(pSize.finalPrice - product.basePrice) }})
              </span>
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Độ ngọt</h4>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="opt in sugarOptions"
              :key="opt.value"
              @click="sugarLevel = opt.value"
              class="py-2 rounded-lg border text-sm transition-colors"
              :class="
                sugarLevel === opt.value
                  ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              "
              :title="opt.fullLabel"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Đá / Nhiệt độ
          </h4>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="opt in iceOptions"
              :key="opt.value"
              @click="iceLevel = opt.value"
              class="py-2 rounded-lg border text-sm transition-colors"
              :class="
                iceLevel === opt.value
                  ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              "
              :title="opt.fullLabel"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Ghi chú</h4>
          <textarea
            v-model="note"
            rows="2"
            placeholder="VD: Mang về, để riêng đá..."
            class="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>
      </div>

      <div class="p-4 border-t border-gray-100 bg-white grid grid-cols-3 gap-4">
        <div class="col-span-1 flex items-center justify-between bg-gray-100 rounded-xl px-2">
          <button
            @click="quantity > 1 && quantity--"
            class="w-8 h-full text-xl font-bold text-gray-500 hover:text-black"
          >
            -
          </button>
          <span class="font-bold text-gray-800">{{ quantity }}</span>
          <button
            @click="quantity++"
            class="w-8 h-full text-xl font-bold text-gray-500 hover:text-black"
          >
            +
          </button>
        </div>

        <button
          @click="confirmAdd"
          class="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 shadow-lg shadow-blue-200 transition-all active:scale-95 flex flex-col items-center justify-center leading-none"
        >
          <span class="text-sm">Thêm vào đơn</span>
          <span class="text-xs opacity-90 mt-1">{{
            formatPrice(currentUnitPrice * quantity)
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
