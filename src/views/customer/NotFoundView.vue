<script setup>
import { useRouter } from 'vue-router'
// Để đảm bảo component này không làm rối layout chính, ta có thể dùng router-link
// hoặc dùng router.push nếu muốn logic phức tạp hơn.
const router = useRouter()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] py-12 bg-gray-50 dark:bg-gray-900 text-center"
  >
    <h1 class="text-9xl font-extrabold text-green-600 dark:text-green-500 tracking-widest">404</h1>

    <div class="bg-red-600 px-4 py-1 text-sm text-white rounded rotate-12 shadow-md">
      Trang không tồn tại
    </div>

    <p class="text-2xl font-semibold mt-8 text-gray-800 dark:text-gray-100">
      Rất tiếc, chúng tôi không tìm thấy trang bạn yêu cầu.
    </p>

    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
    </p>

    <router-link
      to="/"
      class="mt-8 inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
      Quay về trang chủ
    </router-link>
  </div>
</template>
