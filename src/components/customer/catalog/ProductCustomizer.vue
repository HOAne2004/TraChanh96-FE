<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useProductStore } from '@/stores/catalog/product.store'
import { useCartStore } from '@/stores/sales/cart.store'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { useUserStore } from '@/stores/identity/user.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useSizeStore } from '@/stores/catalog/size.store'

import { formatPrice } from '@/utils/formatters'

import ProductSelectors from '@/components/customer/catalog/ProductSelectors.vue'
import ProductActions from '@/components/customer/catalog/ProductActions.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isModal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['added-to-cart', 'buy-now'])

const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const sizeStore = useSizeStore()
const toastStore = useToastStore()

const { products } = storeToRefs(productStore)
const { stores, selectedStoreId, storeMenu } = storeToRefs(storeStore)
const { sizes } = storeToRefs(sizeStore)

// Local State
const quantity = ref(1)
const selectedSize = ref(null)
const selectedSugar = ref(null)
const selectedIce = ref(null)
const selectedToppings = ref([])
const note = ref('')
const isAdding = ref(false)

const allowedSugarLevels = computed(() => props.product?.allowedSugarLevels || [])
const allowedIceLevels = computed(() => props.product?.allowedIceLevels || [])

// Logic
const isAvailableAtStore = computed(() => {
  if (!selectedStoreId.value) return true
  if (storeMenu.value.length > 0) {
    const itemInStore = storeMenu.value.find(
      (p) => p.id === props.product.id || p.productId === props.product.id,
    )
    return !!itemInStore
  }
  return true
})

const storeStatus = computed(() => {
  if (!selectedStoreId.value) return { isOpen: true }
  const store = stores.value.find((s) => s.id === selectedStoreId.value)
  return storeStore.getStoreStatus(store)
})

const isActionDisabled = computed(() => {
  return (
    isAdding.value ||
    (selectedStoreId.value && !storeStatus.value.isOpen) ||
    !isAvailableAtStore.value
  )
})

const isDrink = computed(() => props.product.productType?.toLowerCase() === 'drink')

const isSoldOut = computed(() => {
  if (!selectedStoreId.value) return false

  if (storeMenu.value.length > 0) {
    const item = storeMenu.value.find(
      (p) => p.id === props.product.id || p.productId === props.product.id,
    )
    if (item && (item.isSoldOut || item.storeStatus === 'OutOfStock')) {
      return true
    }
  }
  return false
})

const availableToppings = computed(() => {
  if (!products.value) return []
  const allowedIds = props.product.allowedToppingIds || []
  return products.value.filter((p) => {
    const isTopping =
      p.productType?.toLowerCase() === 'topping' || p.categoryName?.toLowerCase() === 'topping'
    const isAllowed = allowedIds.includes(p.id)
    let isAvailableInStore = true
    if (selectedStoreId.value && p.storeIds) {
      isAvailableInStore = p.storeIds.includes(selectedStoreId.value)
    }
    return isTopping && isAllowed && isAvailableInStore
  })
})

const renderedSizes = computed(() => {
  if (!props.product || !props.product.productSizes) return []
  return props.product.productSizes
    .map((ps) => {
      const globalSize = sizes.value.find((s) => s.id === ps.sizeId)
      if (!globalSize) return null
      let displayDiff = 0
      if (ps.priceOverride && Number(ps.priceOverride) > 0) {
        displayDiff = Number(ps.priceOverride) - Number(props.product.basePrice)
      } else {
        displayDiff = Number(globalSize.priceModifier || 0)
      }
      return {
        id: ps.sizeId,
        label: globalSize.name || globalSize.label || 'Size',
        priceModifier: displayDiff,
        priceOverride: ps.priceOverride,
        originalModifier: globalSize.priceModifier,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.originalModifier || 0) - (b.originalModifier || 0) || a.id - b.id)
})

// --- TỰ ĐỘNG CHỌN GIÁ TRỊ MẶC ĐỊNH ---
watch(
  () => props.product,
  () => {
    // 1. Auto select size
    if (isDrink.value && renderedSizes.value.length > 0) {
      selectedSize.value = renderedSizes.value[0]
    } else {
      selectedSize.value = null
    }

    // 2. Auto select Đường: Ưu tiên 100%, nếu không có thì lấy cái đầu tiên
    if (isDrink.value && allowedSugarLevels.value.length > 0) {
      selectedSugar.value = allowedSugarLevels.value.includes(100) ? 100 : allowedSugarLevels.value[0]
    } else {
      selectedSugar.value = null 
    }

    // 3. Auto select Đá: Ưu tiên 100%, nếu không có thì lấy cái đầu tiên
    if (isDrink.value && allowedIceLevels.value.length > 0) {
      selectedIce.value = allowedIceLevels.value.includes(100) ? 100 : allowedIceLevels.value[0]
    } else {
      selectedIce.value = null
    }
  },
  { immediate: true }
)

const finalPrice = computed(() => {
  if (!props.product) return 0
  let price = Number(props.product.basePrice)
  if (selectedSize.value) {
    if (selectedSize.value.priceOverride && Number(selectedSize.value.priceOverride) > 0) {
      price += Number(selectedSize.value.priceOverride)
    } else {
      price += Number(selectedSize.value.originalModifier || 0)
    }
  }
  if (selectedToppings.value.length > 0) {
    const toppingsTotal = selectedToppings.value.reduce((sum, t) => sum + Number(t.basePrice), 0)
    price += toppingsTotal
  }
  return price
})

const totalPrice = computed(() => finalPrice.value * quantity.value)

const toggleTopping = (topping) => {
  const index = selectedToppings.value.findIndex((t) => t.id === topping.id)
  if (index === -1) selectedToppings.value.push(topping)
  else selectedToppings.value.splice(index, 1)
}

const handleAddToCart = async (isBuyNow = false) => {
  if (selectedStoreId.value && !storeStatus.value.isOpen) {
    return toastStore.show({
      type: 'error',
      message: `Cửa hàng đang: ${storeStatus.value.message}`,
    })
  }
  if (!userStore.isLoggedIn) {
    toastStore.show({ type: 'warning', message: 'Vui lòng đăng nhập để đặt món!' })
    return router.push('/login')
  }
  if (!selectedStoreId.value)
    return toastStore.show({ type: 'warning', message: 'Vui lòng chọn cửa hàng trước!' })
  if (!isAvailableAtStore.value)
    return toastStore.show({
      type: 'error',
      message: 'Sản phẩm này không phục vụ tại cửa hàng đã chọn.',
    })

  const productStoreIds = props.product?.storeIds
  if (productStoreIds?.length && !productStoreIds.includes(selectedStoreId.value)) {
    return toastStore.show({
      type: 'error',
      message: 'Sản phẩm này hiện không bán tại cửa hàng đã chọn',
    })
  }

  if (!selectedSize.value && renderedSizes.value.length > 0) {
    return toastStore.show({ type: 'warning', message: 'Vui lòng chọn kích cỡ!' })
  }

  isAdding.value = true
  try {
    const payload = {
      storeId: selectedStoreId.value,
      productId: props.product.id,
      quantity: quantity.value,
      sizeId: selectedSize.value?.id ?? null,
      sugarLevelId: selectedSugar.value,
      iceLevelId: selectedIce.value,
      note: note.value,
      toppings: selectedToppings.value.map((t) => ({ productId: t.id, quantity: 1 })),
    }

    await cartStore.addToCart(payload)

    if (isBuyNow) {
      emit('buy-now', { storeId: selectedStoreId.value })
    } else {
      toastStore.show({ type: 'success', message: 'Đã thêm món vào giỏ hàng!' })
      quantity.value = 1
      selectedToppings.value = []
      note.value = ''
      emit('added-to-cart')
    }
  } catch (err) {
    toastStore.show({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra.' })
  } finally {
    isAdding.value = false
  }
}
</script>

<template>
  <div class="w-full space-y-4">
    <div v-if="!isModal">
      <span class="text-green-600 font-medium tracking-wide uppercase text-sm mb-2">
        {{ product.categoryName || 'Đồ uống' }}
      </span>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
        {{ product.name }}
      </h1>
      <div class="text-3xl font-extrabold text-primary mb-6">
        {{ formatPrice(finalPrice) }}đ
      </div>
      <hr class="border-gray-200 dark:border-gray-700 mb-6" />
    </div>

    <ProductSelectors
      :is-drink="isDrink"
      :sizes="renderedSizes"
      :available-toppings="availableToppings"
      :allowed-sugar-levels="allowedSugarLevels"
      :allowed-ice-levels="allowedIceLevels"
      v-model:selected-size="selectedSize"
      v-model:selected-sugar="selectedSugar"
      v-model:selected-ice="selectedIce"
      :selected-toppings="selectedToppings"
      @toggle-topping="toggleTopping"
    />

    <ProductActions
      v-model:quantity="quantity"
      v-model:note="note"
      :total-price="totalPrice"
      :is-adding="isAdding"
      :store-status="storeStatus"
      :is-disabled="isActionDisabled || isSoldOut"
      :has-selected-store="!!selectedStoreId"
      :is-available-at-store="isAvailableAtStore"
      :is-sold-out="isSoldOut"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>
