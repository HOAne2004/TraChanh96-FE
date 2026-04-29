<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

// --- CONSTANTS & UTILS ---
import { ORDER_TYPE } from '@/constants/order.constants' // Giả định file này tồn tại: { DELIVERY: 1, PICKUP: 2 }
import { calculateDistance } from '@/utils/distance'
import { formatPrice } from '@/utils/formatters'

// --- STORES ---
import { useCartStore } from '@/stores/sales/cart.store'
import { useUserStore } from '@/stores/identity/user.store'
import { useOrderStore } from '@/stores/sales/order.store'
import { useStoreStore } from '@/stores/store-operations/store.store'
import { usePaymentMethodStore } from '@/stores/sales/paymentMethod.store'
import { useUserVoucherStore } from '@/stores/marketing/userVoucher.store'
import { useToastStore } from '@/stores/system/toast.store'
import { useAddressStore } from '@/stores/identity/address.store'

// --- COMPONENTS ---
import OrderTypeSelector from '@/components/customer/sales/OrderTypeSelector.vue'
import CheckoutAddressSection from '@/components/customer/sales/CheckoutAddressSection.vue'
import StoreDistanceCard from '@/components/customer/store-operations/StoreDistanceCard.vue'
import PickupTimeSelector from '@/components/customer/sales/PickupTimeSelector.vue'
import CheckoutPaymentMethods from '@/components/customer/sales/CheckoutPaymentMethods.vue'
import CheckoutItemList from '@/components/customer/sales/CheckoutItemList.vue'
import OrderSummary from '@/components/customer/sales/OrderSummary.vue'
import CheckoutSubmitBar from '@/components/customer/sales/CheckoutSubmitBar.vue'

// --- INIT ---
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

const cartStore = useCartStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const storeStore = useStoreStore()
const paymentMethodStore = usePaymentMethodStore()
const voucherStore = useUserVoucherStore()
const addressStore = useAddressStore()

const { cartItems: allCartItems } = storeToRefs(cartStore)
const { isLoggedIn } = storeToRefs(userStore)
const { addresses } = storeToRefs(addressStore)
const { currentDiscountAmount, appliedVoucher } = storeToRefs(voucherStore)
const { shippingFee, isCalculatingShip } = storeToRefs(orderStore)
const { calculateShippingFeeAction } = orderStore

// --- STATE ---
const orderType = ref(ORDER_TYPE.DELIVERY) // Mặc định là Giao hàng
const selectedAddressId = ref(null)
const selectedPaymentMethod = ref(null)
const pickupTime = ref(null) // Date Object hoặc String ISO
const userNotes = ref('')
const isSubmitting = ref(false)
const currentStore = ref(null) // Chi tiết store (lat, lng, shipping config)
const distanceKm = ref(0) // Khoảng cách tính toán

// --- COMPUTED: STORE & ITEMS ---
const targetStoreId = computed(() => {
  if (route.query.storeId) return Number(route.query.storeId)
  if (cartStore.lastActiveStoreId) return cartStore.lastActiveStoreId
  return null
})

const checkoutItems = computed(() => {
  if (!targetStoreId.value) return []
  return allCartItems.value.filter((item) => item.storeId === targetStoreId.value)
})

// --- COMPUTED: VALIDATION DELIVERY ---
const isOutOfDeliveryRadius = computed(() => {
  if (orderType.value !== ORDER_TYPE.DELIVERY) return false
  if (!distanceKm.value) return false
  const maxRadius = currentStore.value?.deliveryRadius || 20
  return distanceKm.value > maxRadius
})

// --- COMPUTED: FEES & TOTAL ---
const subtotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
})

// Preview phí ship (Frontend Only)
// const shippingFeePreview = computed(() => {
//   if (orderType.value === ORDER_TYPE.PICKUP) return 0
//   if (!distanceKm.value || !currentStore.value) return 0
//   if (currentStore.value.shippingFeeFixed != null) {
//     return currentStore.value.shippingFeeFixed
//   }
//   const feePerKm = currentStore.value.shippingFeePerKm || 5000 // Fallback 5k
//   const rawFee = distanceKm.value * feePerKm
//   return Math.ceil(rawFee / 1000) * 1000
// })

// --- COMPUTED: CAN SUBMIT ---
const canSubmit = computed(() => {
  if (!selectedPaymentMethod.value) return false
  if (checkoutItems.value.length === 0) return false

  if (orderType.value === ORDER_TYPE.DELIVERY) {
    // Phải chọn địa chỉ và nằm trong bán kính
    return selectedAddressId.value && !isOutOfDeliveryRadius.value
  }

  if (orderType.value === ORDER_TYPE.PICKUP) {
    return !!pickupTime.value
  }

  return false
})

// --- WATCHERS ---

// 1. Load Store Details khi targetStoreId đổi
const displayStoreId = computed(() => {
  if (route.query.previewStoreId) return parseInt(route.query.previewStoreId)
  if (storeStore.selectedStoreId) return storeStore.selectedStoreId
  return targetStoreId.value
})

// 1. Load Store Details khi displayStoreId đổi
watch(
  displayStoreId,
  async (newId) => {
    if (newId) {
      try {
        const store = await storeStore.fetchStoreById(newId)
        if (store) {
          currentStore.value = store
        } else {
          console.error('Store fetched is null')
        }
      } catch (e) {
        console.error('Error fetching store:', e)
      }
    }
  },
  { immediate: true },
)

// 2. Tính khoảng cách khi đổi Địa chỉ hoặc Store
const selectedAddress = computed(() => {
  if (!selectedAddressId.value || !addresses.value) return null
  return addresses.value.find((a) => a.id === selectedAddressId.value)
})

watch(
  [selectedAddress, currentStore],
  ([addr, store]) => {
    if (!addr || !store || !store.latitude || !addr.latitude) {
      distanceKm.value = 0
      return
    }
    const dist = calculateDistance(
      Number(store.latitude),
      Number(store.longitude),
      Number(addr.latitude),
      Number(addr.longitude),
    )
    distanceKm.value = dist
  },
  { immediate: true },
)

watch(
  [selectedAddress, currentStore, orderType],
  async ([addr, store, type]) => {
    if (type !== ORDER_TYPE.DELIVERY || !addr || !store) {
      shippingFee.value = 0
      return
    }

    await calculateShippingFeeAction(store.id, addr.id)
  },
  { immediate: true },
)

const total = computed(() => {
  const t = subtotal.value + shippingFee.value - (currentDiscountAmount.value || 0)
  return t > 0 ? t : 0
})
// 3. Reset state khi đổi Order Type
watch(orderType, (newType) => {
  if (newType === ORDER_TYPE.PICKUP) {
    console.log('Payment Method hiện tại:', selectedPaymentMethod.value)

    if (selectedPaymentMethod.value) {
      const type = selectedPaymentMethod.value.paymentType
      const code = selectedPaymentMethod.value.code

      const isCod = String(type).toLowerCase() === 'cod' || String(code).toLowerCase() === 'cod'

      if (isCod) {
        console.log('>>> Phát hiện COD, đang reset về null...')
        selectedPaymentMethod.value = null
        toastStore.show({
          message: 'Đơn hàng "Đến lấy" vui lòng thanh toán Online (VNPAY/Momo).',
          type: 'info',
        })
      }
    }
  }
})

// --- LIFECYCLE ---
onMounted(async () => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }

  // Đảm bảo có cart
  if (allCartItems.value.length === 0) {
    await cartStore.fetchCart()
  }
  if (checkoutItems.value.length === 0) {
    toastStore.show({ message: 'Giỏ hàng trống!', type: 'warning' })
    router.replace('/products')
    return
  }
  await paymentMethodStore.fetchActiveMethods()

  await addressStore.fetchAddresses()

  if (addresses.value && addresses.value.length > 0) {
    const defaultAddr = addresses.value.find((a) => a.isDefault) || addresses.value[0]
    selectedAddressId.value = defaultAddr.id
  }
})

// --- SUBMIT HANDLER ---
const handleAttemptSubmit = () => {
  if (orderType.value === ORDER_TYPE.DELIVERY) {
    if (!selectedAddressId.value) {
      toastStore.show({ message: 'Vui lòng chọn địa chỉ nhận hàng.', type: 'warning' })
      return
    }
    if (isOutOfDeliveryRadius.value) {
      const limit = currentStore.value?.deliveryRadius || 20
      toastStore.show({
        message: `Địa chỉ quá xa (>${limit}km). Vui lòng chọn địa chỉ khác.`,
        type: 'error',
      })
      return
    }
  } else if (orderType.value === ORDER_TYPE.PICKUP) {
    if (!pickupTime.value) {
      toastStore.show({ message: 'Vui lòng chọn thời gian đến lấy.', type: 'warning' })
      return
    }
  }

  if (checkoutItems.value.length === 0) {
    toastStore.show({ message: 'Giỏ hàng đang trống!', type: 'warning' })
    return
  }

  if (!selectedPaymentMethod.value) {
    toastStore.show({ message: 'Vui lòng chọn phương thức thanh toán.', type: 'warning' })
    return
  }
  // Nếu qua hết validate -> Gọi hàm submit thật
  handleSubmitOrder()
}

const handleSubmitOrder = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    let resultOrder = null

    // Payload chung
    const basePayload = {
      storeId: targetStoreId.value,
      paymentMethodId: selectedPaymentMethod.value.id,
      userNotes: userNotes.value,
      voucherCode: appliedVoucher.value?.voucherCode,
      items: checkoutItems.value.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        sizeId: i.sizeId,
        sugarLevel: i.sugarLevel,
        iceLevel: i.iceLevel,
        toppings: i.toppings?.map((t) => ({ productId: t.id, quantity: 1 })) || [],
      })),
    }

    if (orderType.value === ORDER_TYPE.DELIVERY) {
      // Gọi API Delivery
      resultOrder = await orderStore.createDeliveryOrderAction({
        ...basePayload,
        deliveryAddressId: selectedAddressId.value,
      })
    } else {
      // Gọi API Pickup
      resultOrder = await orderStore.createPickupOrderAction({
        ...basePayload,
        pickupTime: pickupTime.value, // Format ISO string nếu cần
      })
    }

    // Success Handling
    toastStore.show({ message: 'Đặt hàng thành công!', type: 'success' })
    voucherStore.removeAppliedVoucher()
    await cartStore.clearCartByStore(targetStoreId.value)

    // Redirect
    if (resultOrder.paymentUrl) {
      window.location.href = resultOrder.paymentUrl
    } else {
      router.replace({ name: 'order-detail', params: { code: resultOrder.orderCode } })
    }
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || 'Lỗi tạo đơn hàng'
    toastStore.show({ message: msg, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="py-8 max-w-6xl mx-auto px-4 lg:px-8 min-h-screen bg-gray-50 dark:bg-gray-900">
    <h1 class="text-3xl font-bold mb-6 text-green-600 uppercase text-center">Thanh toán</h1>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 space-y-6">
        <OrderTypeSelector v-model="orderType" :types="[ORDER_TYPE.DELIVERY, ORDER_TYPE.PICKUP]" />
        <StoreDistanceCard
          v-if="currentStore"
          :store="currentStore"
          :distance-km="orderType === ORDER_TYPE.DELIVERY ? distanceKm : 0"
          :is-out-of-radius="orderType === ORDER_TYPE.DELIVERY && isOutOfDeliveryRadius"
          :mode="orderType === ORDER_TYPE.PICKUP ? 'simple' : 'full'"
        />

        <div v-if="orderType === ORDER_TYPE.DELIVERY" class="space-y-6">
          <CheckoutAddressSection
            v-model="selectedAddressId"
            :store="currentStore"
            :is-logged-in="isLoggedIn"
          />
        </div>

        <div v-else class="space-y-6">
          <PickupTimeSelector v-model="pickupTime" :store="currentStore" />
        </div>

        <CheckoutPaymentMethods
          v-model="selectedPaymentMethod"
          :allow-cod="orderType === ORDER_TYPE.DELIVERY"
        />

        <CheckoutItemList
          :items="checkoutItems"
          :store-name="currentStore?.name || 'Đang tải...'"
          :format-currency="formatPrice"
        />

        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <label class="block font-semibold mb-2">Ghi chú cho quán</label>
          <textarea
            v-model="userNotes"
            rows="2"
            maxlength="200"
            class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:border-gray-600"
            placeholder="Ví dụ: Ít ngọt, xin thêm tương ớt..."
          ></textarea>
        </div>
      </div>

      <div class="lg:col-span-4">
        <div class="sticky top-24 space-y-4">
          <OrderSummary
            :subtotal="subtotal"
            :shipping-fee="shippingFee"
            :discount="currentDiscountAmount"
            :total="total"
            :order-type="orderType"
          />

          <CheckoutSubmitBar
            :loading="isSubmitting"
            :total="total"
            :is-valid="canSubmit"
            :label="orderType === ORDER_TYPE.DELIVERY ? 'ĐẶT GIAO HÀNG' : 'ĐẶT ĐẾN LẤY'"
            @submit="handleAttemptSubmit"
          />

          <div
            v-if="orderType === ORDER_TYPE.DELIVERY && isOutOfDeliveryRadius"
            class="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200"
          >
            ⚠️ Địa chỉ quá xa giới hạn giao hàng của quán. Vui lòng chọn địa chỉ khác hoặc đổi sang
            Đến lấy.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
