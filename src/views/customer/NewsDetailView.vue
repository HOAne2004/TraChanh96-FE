<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { storeToRefs } from 'pinia'
import { resolveImage } from '@/utils/image'

// Components
import NavLink from '@/components/common/NavLink.vue'
import defaultNewsImage from '@/assets/images/others/default-drink.png' // Hoặc ảnh default tin tức khác
import CommentSection from '@/components/customer/comment/CommentSection.vue'

const route = useRoute()
const newsStore = useNewsStore()
// Lấy currentNews (chi tiết) và publishedNews (để làm tin liên quan)
const { currentNews, publishedNews, loading } = storeToRefs(newsStore)

// 1. Hàm load dữ liệu
const loadData = async () => {
  const slug = route.params.slug
  if (!slug) return

  // Gọi API lấy chi tiết bài viết
  await newsStore.fetchNewsBySlug(slug)

  // Nếu danh sách tin liên quan chưa có, gọi thêm API lấy list
  if (publishedNews.value.length === 0) {
    await newsStore.fetchPublishedNews()
  }

  // Cuộn lên đầu
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 2. Lifecycle
onMounted(() => {
  loadData()
})

// 3. Watch: Khi đổi slug (click tin liên quan), load lại dữ liệu
watch(
  () => route.params.slug,
  () => {
    loadData()
  },
)

// 4. Computed: Tin tức liên quan (Lọc bài hiện tại ra)
const relatedArticles = computed(() => {
  if (!publishedNews.value.length || !currentNews.value) return []
  return publishedNews.value
    .filter((a) => a.id !== currentNews.value.id) // Loại trừ bài đang xem
    .slice(0, 3) // Lấy 3 bài
})

// 5. Xử lý ảnh lỗi
const handleImageError = (e) => {
  e.target.src = defaultNewsImage
  e.target.onerror = null
}
</script>

<template>
  <main class="py-8 max-w-4xl mx-auto px-4 lg:px-8 min-h-screen">
    <div v-if="loading" class="text-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"
      ></div>
      <p class="text-gray-500">Đang tải bài viết...</p>
    </div>

    <div v-else-if="!currentNews" class="text-center py-20">
      <h1 class="text-3xl font-bold text-red-500">Tin tức không tồn tại!</h1>
      <RouterLink to="/news" class="text-green-600 hover:underline mt-4 block">
        Quay lại trang Tin tức
      </RouterLink>
    </div>

    <div v-else>
      <div class="mb-4 text-gray-500 flex items-center gap-2 text-sm">
        <NavLink to="/news" label="Tin tức" variant="secondary" />
        <span>/</span>
        <span
          class="font-medium text-gray-800 dark:text-gray-300 truncate max-w-[200px] sm:max-w-md"
        >
          {{ currentNews.title }}
        </span>
      </div>

      <article
        class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <h1
          class="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight"
        >
          {{ currentNews.title }}
        </h1>

        <div
          class="text-sm text-gray-500 dark:text-gray-400 mb-6 border-b dark:border-gray-700 pb-4 flex flex-wrap gap-4"
        >
          <span class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ new Date(currentNews.publishedDate).toLocaleDateString('vi-VN') }}
          </span>
          <span class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {{ currentNews.userName || 'Admin' }}
          </span>
        </div>

        <div class="mb-8 rounded-xl overflow-hidden shadow-sm">
          <img
            :src="resolveImage(currentNews.thumbnailUrl, defaultNewsImage)"
            :alt="currentNews.title"
            class="w-full h-auto max-h-[500px] object-cover"
            @error="handleImageError"
          />
        </div>

        <div
          class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
          v-html="currentNews.content"
        ></div>
      </article>

      <CommentSection v-if="currentNews" :news-id="currentNews.id" />

      <section v-if="relatedArticles.length" class="mt-12">
        <h2
          class="text-2xl font-bold mb-6 text-green-700 dark:text-green-400 border-l-4 border-green-600 pl-3"
        >
          Tin tức liên quan
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RouterLink
            v-for="article in relatedArticles"
            :key="article.id"
            :to="`/news/${article.slug}`"
            class="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            <div class="h-48 overflow-hidden">
              <img
                :src="resolveImage(article.thumbnailUrl, defaultNewsImage)"
                class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                :alt="article.title"
                @error="handleImageError"
              />
            </div>
            <div class="p-4">
              <h3
                class="font-bold text-lg mb-2 group-hover:text-green-600 line-clamp-2 transition-colors"
              >
                {{ article.title }}
              </h3>
              <p class="text-xs text-gray-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ new Date(article.publishedDate).toLocaleDateString('vi-VN') }}
              </p>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Tùy chỉnh CSS cho nội dung bài viết nếu cần */
.prose img {
  border-radius: 0.75rem;
  margin-left: auto;
  margin-right: auto;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
