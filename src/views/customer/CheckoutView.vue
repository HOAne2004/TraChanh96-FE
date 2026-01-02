<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

// Stores
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useUserVoucherStore } from '@/stores/userVoucher'
import { useToastStore } from '@/stores/toast'
import { usePaymentMethodStore } from '@/stores/paymentMethod'

// Components
import CheckoutAddressForm from '@/components/customer/checkout/CheckoutAddressForm.vue'
import CheckoutPaymentMethods from '@/components/customer/checkout/CheckoutPaymentMethods.vue'
import CheckoutItemList from '@/components/customer/checkout/CheckoutItemList.vue'
import CheckoutSummary from '@/components/customer/checkout/CheckoutSummary.vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const toastStore = useToastStore()
const voucherStore = useUserVoucherStore()
const paymentMethodStore = usePaymentMethodStore()
const route = useRoute()

const { cartItems: allCartItems } = storeToRefs(cartStore)
const { isLoggedIn } = storeToRefs(userStore)
const { currentDiscountAmount, appliedVoucher } = storeToRefs(voucherStore)
const { shippingFee, isCalculatingShip } = storeToRefs(orderStore)

// --- STATE ---
const selectedAddressId = ref(null) // ID địa chỉ (Quan trọng)
const selectedPaymentMethod = ref(null) // Object Payment Method
const userNotes = ref('')
const orderLoading = ref(false)

const targetStoreId = computed(() => {
  if (route.query.storeId) return parseInt(route.query.storeId)
  // Fallback: Nếu không truyền storeId, mặc định lấy store của món đầu tiên (cho trường hợp đơn giản)
  return allCartItems.value.length > 0 ? allCartItems.value[0].storeId : null
})

// --- LỌC SẢN PHẨM THEO STORE ---
const checkoutItems = computed(() => {
  if (!targetStoreId.value) return []
  // Giả sử mỗi item trong cart đều có thuộc tính storeId
  return allCartItems.value.filter((item) => item.storeId === targetStoreId.value)
})

const currentStoreName = computed(() => {
  if (checkoutItems.value.length > 0) {
    return checkoutItems.value[0].storeName || 'Cửa hàng'
  }
  return ''
})
watch([selectedAddressId, targetStoreId], async ([newAddrId, newStoreId]) => {
  if (newAddrId && newStoreId) {
    // Gọi store tính toán
    await orderStore.calculateShippingFeeAction(newStoreId, newAddrId)
  } else {
    orderStore.resetShippingFee()
  }
})

// Redirect nếu giỏ hàng trống
onMounted(async () => {
  // 1. Nếu Store chưa có dữ liệu (do F5 reload), hãy gọi API lấy lại giỏ hàng
  if (allCartItems.value.length === 0 && isLoggedIn.value) {
    await cartStore.fetchCart()
  }

  // 2. Sau khi load xong, kiểm tra lại xem có món nào của Store này không
  if (checkoutItems.value.length === 0) {
    toastStore.show({
      message: 'Giỏ hàng trống hoặc không tìm thấy sản phẩm của cửa hàng này',
      type: 'warning',
    })
    router.replace('/products')
  }
  await paymentMethodStore.fetchActiveMethods()

  if (targetStoreId.value && selectedAddressId.value) {
    await orderStore.calculateShippingFeeAction(targetStoreId.value, selectedAddressId.value)
  }
})

// --- TÍNH TOÁN ---
const subtotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
})
const discount = computed(() => currentDiscountAmount.value || 0)

const total = computed(() => {
  const t = subtotal.value + shippingFee.value - discount.value
  return t > 0 ? t : 0
})

// --- XỬ LÝ VOUCHER ---
const onApplyVoucher = async (code) => {
  try {
    await voucherStore.applyVoucherAction(code, subtotal.value)
    toastStore.show({ message: 'Áp dụng voucher thành công!', type: 'success' })
  } catch (err) {
    toastStore.show({ message: err.message || 'Voucher không hợp lệ', type: 'error' })
  }
}
// --- XỬ LÝ ĐẶT HÀNG (QUAN TRỌNG) ---
const placeOrder = async () => {
  // 1. VALIDATION (Yêu cầu của bạn)
  if (!selectedAddressId.value) {
    toastStore.show({ message: 'Vui lòng chọn hoặc thêm địa chỉ nhận hàng.', type: 'error' })
    return
  }

  if (!selectedPaymentMethod.value) {
    toastStore.show({ message: 'Vui lòng chọn phương thức thanh toán.', type: 'error' })
    return
  }

  orderLoading.value = true

  try {
    const payload = {
      storeId: targetStoreId.value,
      deliveryAddressId: selectedAddressId.value,
      paymentMethodId:
        typeof selectedPaymentMethod.value.id === 'string' ? null : selectedPaymentMethod.value.id,
      userNotes: userNotes.value || '',
      voucherCode: appliedVoucher.value?.voucherCode || null,

      items: checkoutItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        sizeId: item.sizeId,
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel,
        note: item.note,
        toppings: item.toppings
          ? item.toppings.map((t) => ({
              productId: t.id,
              quantity: 1,
            }))
          : [],
      })),
    }

    console.log('Sending Order Payload:', payload) // Debug xem dữ liệu đúng chưa

    // 3. GỌI API
    const newOrder = await orderStore.createDeliveryOrderAction(payload)

    // 4. THÀNH CÔNG
    voucherStore.removeAppliedVoucher()
    toastStore.show({ message: 'Đặt hàng thành công!', type: 'success' })
    if (targetStoreId.value) {
      await cartStore.clearCartByStore(targetStoreId.value)
    }

    // 5. CHUYỂN HƯỚNG
    // Nếu là Online Payment (VNPAY/Momo...)
    if (selectedPaymentMethod.value.paymentType !== 'Cash' && newOrder.paymentUrl) {
      window.location.href = newOrder.paymentUrl
    } else {
      // Nếu COD -> Sang trang chi tiết
      await router.replace({ name: 'order-detail', params: { code: newOrder.orderCode } })
    }
  } catch (error) {
    console.error('Lỗi đặt hàng:', error)
    const msg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.'
    toastStore.show({ message: msg, type: 'error' })
  } finally {
    if (!selectedAddressId.value) orderLoading.value = false
  }
}
watch(checkoutItems, (newItems) => {
  if (newItems.length === 0 && !orderLoading.value) {
    // !orderLoading để tránh redirect nhầm lúc đang gọi API đặt hàng
    router.replace('/cart')
  }
})

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
</script>

<template>
  <main class="py-8 max-w-6xl mx-auto px-4 lg:px-8">
    <h1
      class="text-2xl md:text-3xl font-bold mb-8 text-center text-green-700 dark:text-green-400 uppercase"
    >
      Xác nhận đơn hàng
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <CheckoutAddressForm v-model="selectedAddressId" :is-logged-in="isLoggedIn" />

        <CheckoutPaymentMethods v-model="selectedPaymentMethod" />
        <CheckoutItemList
          :items="checkoutItems"
          :store-name="currentStoreName"
          :format-currency="formatCurrency"
        />
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <div class="flex justify-between items-center mb-3">
            <h2
              class="text-lg font-semibold border-l-4 border-green-500 pl-2 text-gray-800 dark:text-white"
            >
              Ghi chú đơn hàng
            </h2>
            <span
              class="text-xs"
              :class="userNotes.length >= 500 ? 'text-red-500 font-bold' : 'text-gray-400'"
            >
              {{ userNotes.length }}/500
            </span>
          </div>

          <textarea
            v-model="userNotes"
            rows="2"
            maxlength="500"
            placeholder="Ví dụ: Ít ngọt, giao giờ hành chính, gọi trước khi giao..."
            class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none"
          ></textarea>

          <p v-if="userNotes.length >= 500" class="text-xs text-red-500 mt-1">
            Bạn đã nhập tối đa số ký tự cho phép.
          </p>
        </div>
      </div>

      <div class="lg:col-span-1">
        <CheckoutSummary
          class="sticky top-24"
          :subtotal="subtotal"
          :shipping-fee="shippingFee"
          :is-calculating-ship="isCalculatingShip"
          :discount-amount="discount"
          :total="total"
          :cart-is-empty="checkoutItems.length === 0"
          :order-loading="orderLoading"
          :format-currency="formatCurrency"
          @apply-voucher="onApplyVoucher"
          @place-order="placeOrder"
        />
      </div>
    </div>
  </main>
</template>
