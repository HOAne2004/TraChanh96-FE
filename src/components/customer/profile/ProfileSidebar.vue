<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import DarkMode from '@/components/common/DarkMode.vue'

const props = defineProps({
  user: { type: Object, required: true },
  isDropdown: { type: Boolean, default: false }, // Biến này để chỉnh style cho phù hợp ngữ cảnh (Menu bé hay Sidebar to)
})

const emit = defineEmits(['close', 'logout'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Helper kiểm tra active tab
const isActive = (tabName) => {
  // Nếu không có query tab thì mặc định là 'info'
  const currentTab = route.query.tab || 'info'
  return currentTab === tabName && route.path === '/profile'
}

const handleLogout = () => {
  emit('close') // Đóng menu nếu đang ở dropdown
  userStore.logout()
  router.push('/')
}

const handleLinkClick = () => {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      v-if="isDropdown"
      class="px-4 py-3 bg-gray-50/80 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
    >
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tài khoản</p>
      <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ user?.email }}</p>
    </div>

    <div v-else class="mb-6 px-2">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">
        Chào, {{ user?.username || 'Khách' }}!
      </h2>
      <p class="text-sm text-gray-500">{{ user?.email }}</p>
    </div>

    <nav class="flex-1 space-y-1 p-2">
      <router-link
        v-if="user?.role?.toLowerCase() === 'admin'"
        to="/admin"
        @click="handleLinkClick"
        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="
          route.path.startsWith('/admin')
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        "
      >
        <span
          class="p-1.5 rounded-md transition-colors"
          :class="
            route.path.startsWith('/admin')
              ? 'bg-blue-200 text-blue-700'
              : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
            />
          </svg>
        </span>
        Trang quản trị
      </router-link>

      <router-link
        to="/profile"
        @click="handleLinkClick"
        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="
          isActive('info')
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 shadow-sm'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        "
      >
        <span
          class="p-1.5 rounded-md transition-colors"
          :class="
            isActive('info')
              ? 'bg-green-200 text-green-700'
              : 'bg-green-100 text-green-600 group-hover:bg-green-200'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </span>
        Thông tin cá nhân
      </router-link>

      <router-link
        to="/profile?tab=orders"
        @click="handleLinkClick"
        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="
          isActive('orders')
            ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        "
      >
        <span
          class="p-1.5 rounded-md transition-colors"
          :class="
            isActive('orders')
              ? 'bg-orange-200 text-orange-700'
              : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.091-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
        </span>
        Lịch sử đơn hàng
      </router-link>

      <router-link
        to="/profile?tab=security"
        @click="handleLinkClick"
        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="
          isActive('security')
            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 shadow-sm'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        "
      >
        <span
          class="p-1.5 rounded-md transition-colors"
          :class="
            isActive('security')
              ? 'bg-purple-200 text-purple-700'
              : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </span>
        Bảo mật & Mật khẩu
      </router-link>
    </nav>

    <div class="mt-auto p-2 border-t border-gray-100 dark:border-gray-700">
      <div
        class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
        @click.stop
      >
        <div class="flex items-center gap-3">
          <span
            class="p-1.5 bg-gray-200 text-gray-600 rounded-md dark:bg-gray-600 dark:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <defs>
                <linearGradient id="sunMoonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color: #fbbf24; stop-opacity: 1" />
                  <stop offset="50%" style="stop-color: #fbbf24; stop-opacity: 1" />
                  <stop offset="50%" style="stop-color: #4b5563; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #4b5563; stop-opacity: 1" />
                </linearGradient>
              </defs>

              <!-- Hình tròn nền chia đôi -->
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="url(#sunMoonGradient)"
                stroke="#6b7280"
                stroke-width="0.5"
              />

              <!-- Thanh ngăn ở giữa -->
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="22"
                stroke="#1f2937"
                stroke-width="0.8"
                stroke-linecap="round"
              />

              <!-- Mặt trời (bên trái) -->
              <g fill="#92400e">
                <!-- Tia mặt trời -->
                <circle cx="6" cy="7" r="0.8" />
                <circle cx="4" cy="10" r="0.8" />
                <circle cx="6" cy="13" r="0.8" />
                <circle cx="9" cy="15" r="0.8" />
                <circle cx="9" cy="9" r="0.8" />

                <!-- Mặt trời chính -->
                <circle cx="7.5" cy="11.5" r="2.5" fill="#f59e0b" />
              </g>

              <!-- Mặt trăng (bên phải) -->
              <g fill="#374151">
                <!-- Các ngôi sao nhỏ -->
                <circle cx="15" cy="8" r="0.4" />
                <circle cx="18" cy="12" r="0.4" />
                <circle cx="16" cy="15" r="0.4" />

                <!-- Mặt trăng -->
                <path d="M17,11.5 A4,4 0 1,1 17,11.5 A2,2 0 1,0 17,11.5" fill="#9ca3af" />
              </g>
            </svg>
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Giao diện</span>
        </div>
        <div class="transform scale-90">
          <DarkMode />
        </div>
      </div>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-1"
      >
        <span class="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
        </span>
        Đăng xuất
      </button>
    </div>
  </div>
</template>
