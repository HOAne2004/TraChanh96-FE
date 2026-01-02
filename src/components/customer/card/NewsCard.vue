<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'

import defaultNewsImg from '@/assets/images/others/default-news.jpg'

const props = defineProps({
  news: { type: Object, required: true },
})

// 1. Xử lý ảnh
const fullImageUrl = computed(() => resolveImage(props.news.thumbnailUrl, defaultNewsImg))

// 2. Link chi tiết (An toàn: Ưu tiên Slug, nếu không có thì dùng ID)
const link = computed(() => `/news/${props.news.slug}`)

// 3. Xử lý nội dung mô tả (Loại bỏ HTML tag để hiển thị text thuần)
const plainDescription = computed(() => {
  // Nếu có SEO Description thì dùng luôn
  if (props.news.seoDescription) return props.news.seoDescription

  // Nếu không, lấy Content và strip HTML tags
  if (props.news.content) {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = props.news.content
    const text = tmp.textContent || tmp.innerText || ""
    return text
  }
  return "Đang cập nhật..."
})

// 4. Xử lý lỗi ảnh (Tránh vòng lặp)
const handleImageError = (e) => {
  e.target.src = defaultNewsImg
  e.target.onerror = null
}
</script>

<template>
  <div
    class="flex-shrink-0 w-80 snap-start bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-600 group"
  >
    <router-link :to="link" class="block h-full flex flex-col">
      <div class="relative h-48 overflow-hidden">
        <img
          :src="fullImageUrl"
          :alt="news.title"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          @error="handleImageError"
        />

        <div class="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
           {{ formatDate(news.publishedDate).split(' ')[0] }}
        </div>
      </div>

      <div class="p-5 flex flex-col flex-1">
        <h4 class="font-bold text-gray-800 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {{ news.title }}
        </h4>

        <p class="text-sm text-gray-500 dark:text-gray-300 line-clamp-3 mb-4 flex-1">
          {{ plainDescription }}
        </p>

        <span class="text-green-600 font-semibold text-sm flex items-center gap-1 mt-auto">
          Đọc tiếp
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform group-hover:translate-x-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
