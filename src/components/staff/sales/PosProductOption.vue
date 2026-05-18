<script setup>
import { ref, computed, watch } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/catalog/product.store'
import { useToastStore } from '@/stores/system/toast.store'
import { getIceOptions, getSugarOptions, SUGAR_LEVEL_UI, ICE_LEVEL_UI } from '@/constants/option.constants'

const props = defineProps({
  isOpen: Boolean,
  product: Object, // ProductReadDto
})

const emit = defineEmits(['close', 'add-to-cart'])

const toastStore = useToastStore()
const productStore = useProductStore()

// Lấy danh sách toàn bộ sản phẩm để móc Topping ra
const { products } = storeToRefs(productStore)

// --- Options Data ---
const baseIceOptions = getIceOptions()
const baseSugarOptions = getSugarOptions()

// --- State ---
const quantity = ref(1)
const selectedSize = ref(null)
const sugarLevel = ref(null)
const iceLevel = ref(null)
const selectedToppings = ref([]) // 🟢 STATE MỚI CHO TOPPING
const note = ref('')

// --- Helpers ---
// 1. Kiểm tra xem có phải Đồ uống không (để hiện Đường/Đá)
const isDrink = computed(() => {
  const type = props.product?.productType?.toLowerCase()
  const cat = props.product?.categoryName?.toLowerCase()
  return type === 'drink' || cat?.includes('đồ uống') || cat?.includes('trà') || cat?.includes('cafe')
})

// 2. Lọc danh sách Topping (Chỉ lấy những ID được cho phép)
const availableToppings = computed(() => {
  if (!products.value) return []
  const allowedIds = props.product?.allowedToppingIds || []
  return products.value.filter((p) => {
    const isToppingType = p.productType?.toLowerCase() === 'topping' || p.categoryName?.toLowerCase() === 'topping'
    return isToppingType && allowedIds.includes(p.id) && p.status !== 'OutOfStock'
  })
})

// 3. Lọc danh sách Size
const sortedProductSizes = computed(() => {
  if (!props.product?.productSizes) return []
  return [...props.product.productSizes].sort((a, b) => a.finalPrice - b.finalPrice)
})

const parseSugarValue = (val) => {
  if (typeof val === 'number') return val;
  const key = String(val).toLowerCase();
  return SUGAR_LEVEL_UI[key]?.value || null;
}

const parseIceValue = (val) => {
  if (typeof val === 'number') return val;
  const key = String(val).toLowerCase();
  return ICE_LEVEL_UI[key]?.value || null;
}
// 4. Lọc Đường/Đá theo cấu hình Backend
const sugarOptionsList = computed(() => {
  const raw = props.product?.allowedSugarLevels || []
  // Ép kiểu mảng gốc thành số
  const allowed = raw.map(parseSugarValue).filter(n => n !== null)

  if (allowed.length === 0) return baseSugarOptions // Fallback
  return baseSugarOptions.filter(opt => allowed.includes(opt.value))
})

const iceOptionsList = computed(() => {
  const raw = props.product?.allowedIceLevels || []
  // Ép kiểu mảng gốc thành số
  const allowed = raw.map(parseIceValue).filter(n => n !== null)

  if (allowed.length === 0) return baseIceOptions // Fallback
  return baseIceOptions.filter(opt => allowed.includes(opt.value))
})

// --- Logic Tính Giá ---
const finalPrice = computed(() => {
  if (!props.product) return 0
  // Giá base hoặc giá Size
  let price = selectedSize.value ? selectedSize.value.finalPrice : props.product.basePrice

  // Cộng thêm tiền Topping
  if (selectedToppings.value.length > 0) {
    price += selectedToppings.value.reduce((sum, t) => sum + Number(t.basePrice), 0)
  }
  return price
})

// Reset state khi đổi món
watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      quantity.value = 1
      note.value = ''
      selectedToppings.value = []

      // Auto select Size
      if (newVal.productSizes && newVal.productSizes.length > 0) {
        const defaultSize = newVal.productSizes.find((s) => s.finalPrice === newVal.basePrice)
        selectedSize.value = defaultSize || sortedProductSizes.value[0]
      } else {
        selectedSize.value = null
      }

      // Auto select Đường Đá
      if (isDrink.value) {
        sugarLevel.value = sugarOptionsList.value.some(o => o.value === 100) ? 100 : sugarOptionsList.value[0]?.value
        iceLevel.value = iceOptionsList.value.some(o => o.value === 100) ? 100 : iceOptionsList.value[0]?.value
      } else {
        sugarLevel.value = null
        iceLevel.value = null
      }
    }
  }
)

const toggleTopping = (topping) => {
  const idx = selectedToppings.value.findIndex((t) => t.id === topping.id)
  if (idx === -1) selectedToppings.value.push(topping)
  else selectedToppings.value.splice(idx, 1)
}

const closeModal = () => {
  emit('close')
}

const confirmAdd = () => {
  const item = {
    product: props.product,
    quantity: quantity.value,
    options: {
      sizeId: selectedSize.value?.sizeId,
      sizeLabel: selectedSize.value?.sizeLabel,
      sugar: sugarLevel.value,
      ice: iceLevel.value,
    },
    note: note.value,
    // Truyền Topping ra để PosCounterView.vue add vào Store
    toppings: selectedToppings.value.map(t => ({ id: t.id, name: t.name, basePrice: t.basePrice, quantity: 1 })),
    unitPrice: finalPrice.value,
  }
  emit('add-to-cart', item)
  closeModal()
}

const handleIncreaseQuantity = async () => {
  if (quantity.value >= 99) {
    toastStore.show({ type: 'warning', message: 'Chỉ được chọn tối đa 99 sản phẩm.' })
    return
  }
  quantity.value++
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>

    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
      <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 class="font-bold text-lg text-gray-800">{{ product?.name }}</h3>
          <p class="text-sm text-green-600 font-bold">{{ formatPrice(finalPrice) }}</p>
        </div>
        <button @click="closeModal" class="p-2 hover:bg-gray-200 rounded-full text-gray-500">✕</button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div v-if="product?.productSizes?.length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Kích thước</h4>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="pSize in sortedProductSizes"
              :key="pSize.sizeId"
              @click="selectedSize = pSize"
              class="px-4 py-2 rounded-xl border transition-all text-sm font-medium"
              :class="selectedSize?.sizeId === pSize.sizeId ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'"
            >
              {{ pSize.sizeLabel }}
              <span v-if="pSize.finalPrice - product.basePrice > 0">
                (+{{ formatPrice(pSize.finalPrice - product.basePrice) }})
              </span>
            </button>
          </div>
        </div>

        <div v-if="availableToppings.length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Topping</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="topping in availableToppings"
              :key="topping.id"
              @click="toggleTopping(topping)"
              class="flex justify-between items-center px-3 py-2 rounded-lg border text-sm transition-all text-left"
              :class="selectedToppings.find(t => t.id === topping.id) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'"
            >
              <span class="truncate pr-2">{{ topping.name }}</span>
              <span class="text-xs font-bold shrink-0">+{{ formatPrice(topping.basePrice) }}</span>
            </button>
          </div>
        </div>

        <div v-if="isDrink">
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Độ ngọt</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in sugarOptionsList"
                :key="opt.value"
                @click="sugarLevel = opt.value"
                class="px-4 py-2 rounded-lg border text-sm transition-colors"
                :class="sugarLevel === opt.value ? 'bg-green-100 text-green-700 border-green-200 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Đá / Nhiệt độ</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in iceOptionsList"
                :key="opt.value"
                @click="iceLevel = opt.value"
                class="px-4 py-2 rounded-lg border text-sm transition-colors"
                :class="iceLevel === opt.value ? 'bg-green-100 text-green-700 border-green-200 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Ghi chú</h4>
          <textarea
            v-model="note"
            rows="2"
            placeholder="VD: Mang về, để riêng đá..."
            class="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          ></textarea>
        </div>
      </div>

      <div class="p-4 border-t border-gray-100 bg-white grid grid-cols-3 gap-4">
        <div class="col-span-1 flex items-center justify-between bg-gray-100 rounded-xl px-2">
          <button @click="quantity > 1 && quantity--" class="w-8 h-full text-xl font-bold text-gray-500 hover:text-black">-</button>
          <span class="font-bold text-gray-800">{{ quantity }}</span>
          <button @click="handleIncreaseQuantity" class="w-8 h-full text-xl font-bold text-gray-500 hover:text-black">+</button>
        </div>

        <button
          @click="confirmAdd"
          class="col-span-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-3 shadow-lg shadow-green-200 transition-all active:scale-95 flex flex-col items-center justify-center leading-none"
        >
          <span class="text-sm">Thêm vào đơn</span>
          <span class="text-xs opacity-90 mt-1">{{ formatPrice(finalPrice * quantity) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
