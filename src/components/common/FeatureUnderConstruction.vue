<script setup>
import { useRouter } from 'vue-router'
import constructionImg from '@/assets/images/others/dang-phat-trien.png' // Đường dẫn ảnh của bạn

const props = defineProps({
  title: {
    type: String,
    default: 'Tính năng đang phát triển'
  },
  message: {
    type: String,
    default: 'Chúng tôi đang nỗ lực hoàn thiện tính năng này để mang lại trải nghiệm tốt nhất cho bạn.'
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backLabel: {
    type: String,
    default: 'Quay lại trang chủ'
  },
  backLink: {
    type: String,
    default: '/' // Mặc định về Home
  }
})

const router = useRouter()

const handleBack = () => {
  if (props.backLink === 'BACK') {
    router.back() // Quay lại trang trước đó
  } else {
    router.push(props.backLink) // Về link cụ thể
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
    <div class="w-64 md:w-80 mb-8 relative">
        <div class="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
        <img
            :src="constructionImg"
            alt="Đang phát triển"
            class="relative z-10 w-full h-auto object-contain drop-shadow-lg transform transition hover:scale-105 duration-500"
        />
    </div>

    <h2 class="text-2xl md:text-3xl font-extrabold text-green-700 dark:text-green-400 mb-3">
      {{ title }}
    </h2>

    <p class="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
      {{ message }}
    </p>

    <button
      v-if="showBackButton"
      @click="handleBack"
      class="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-semibold rounded-full border border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 transition-transform group-hover:-translate-x-1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {{ backLabel }}
    </button>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
