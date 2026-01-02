<script setup>
import CustomerFooter from '@/components/customer/CustomerFooter.vue'
import CustomerHeader from '@/components/customer/CustomerHeader.vue'
import MobileMenuModal from '@/components/customer/MobileMenuModal.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import {useBrandStore} from '@/stores/brand'
import {useCartStore} from '@/stores/cart'
import {useUserStore} from '@/stores/user'
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

const brandStore = useBrandStore()

onMounted(() => {
  brandStore.fetchPublicBrandInfo()
})

const cartStore = useCartStore()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)

// Hàm helper để load dữ liệu chung
const initGlobalData = async () => {
  if (isLoggedIn.value) {
    await cartStore.fetchCart()
  } else {
    // Nếu chưa login hoặc vừa logout thì reset giỏ hàng về 0
    cartStore.reset()
  }
}

// 1. Khi load trang lần đầu (F5)
onMounted(() => {
  initGlobalData()
})

// 2. Khi trạng thái đăng nhập thay đổi (Login/Logout tại chỗ)
watch(isLoggedIn, () => {
  initGlobalData()
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <!-- Header -->
    <CustomerHeader />

    <!-- Nội dung chính -->
    <main class="flex-1 mt-[72px] sm:mt-[88px]">
      <!-- pt-20 = chừa khoảng cho header fixed (thay cho mt-16) -->
      <RouterView />
    </main>

    <!-- Footer -->
    <CustomerFooter class="mt-auto" :brand="brandStore.brand"/>
    <MobileMenuModal></MobileMenuModal>
    <LoginModal></LoginModal>
  </div>
</template>
