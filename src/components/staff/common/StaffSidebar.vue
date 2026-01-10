<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { USER_ROLE } from '@/constants/user.constants'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Lấy user từ store để check role
const user = computed(() => userStore.user)

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    userStore.logout()
    router.push('/')
  }
}
</script>

<template>
  <aside class="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 shadow-sm z-20">
    <div class="mb-8">
      <img src="@/assets/logo/logo.png" alt="Logo" class="w-10 h-10 object-contain" />
    </div>

    <nav class="flex-1 w-full flex flex-col items-center space-y-4">
      
      <router-link to="/staff/pos" class="nav-item" active-class="active-nav" title="Bán hàng">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="text-[10px] mt-1 font-medium">POS</span>
      </router-link>

      <router-link to="/staff/tables" class="nav-item" active-class="active-nav" title="Sơ đồ bàn">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span class="text-[10px] mt-1 font-medium">Bàn</span>
      </router-link>

      <router-link to="/staff/orders" class="nav-item" active-class="active-nav" title="Bếp/Bar">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span class="text-[10px] mt-1 font-medium">Bếp</span>
      </router-link>

      <router-link to="/staff/orders/history" class="nav-item" active-class="active-nav" title="Lịch sử">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span class="text-[10px] mt-1 font-medium">Đơn</span>
      </router-link>
    </nav>

    <div class="flex flex-col space-y-4 mb-2 w-full items-center">
      <router-link to="/staff/shift" class="nav-item" active-class="active-nav" title="Ca làm việc">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </router-link>

      <router-link
        v-if="user?.role === USER_ROLE.ADMIN"
        to="/admin"
        class="nav-item text-purple-500 hover:text-purple-700 hover:bg-purple-50"
        title="Trang quản trị"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      </router-link>

      <button @click="handleLogout" class="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Đăng xuất">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.nav-item {
  @apply w-14 h-14 flex flex-col items-center justify-center rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer;
}
.active-nav {
  @apply bg-blue-100 text-blue-600 shadow-inner;
}
</style>