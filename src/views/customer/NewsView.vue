<script setup>
import { computed, onMounted, ref } from 'vue'
import { useNewsStore } from '@/stores/marketing/news.store'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

// Components
import NewsCard from '@/components/customer/card/NewsCard.vue'
import Button from '@/components/ui/Button.vue'

const newsStore = useNewsStore()
const { publishedNews } = storeToRefs(newsStore)

// 🚨 BƯỚC MỚI: State quản lý số lượng bài viết hiển thị
const INITIAL_COUNT = 6 // Số bài hiển thị ban đầu
const itemsToShow = ref(INITIAL_COUNT) // State hiện tại

onMounted(async () => {
  await newsStore.fetchPublishedNews()
})

// ----- LOGIC PHÂN LOẠI TIN TỨC -----
const sortedNews = computed(() => {
  if (!publishedNews.value) return []
  // Sắp xếp tất cả tin tức theo ngày (từ mới nhất)
  return [...publishedNews.value].sort(
    (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate),
  )
})

// 1. Bài viết nổi bật (Bài mới nhất)
const featuredArticle = computed(() => {
  return sortedNews.value.length ? sortedNews.value[0] : null
})

// 2. Danh sách bài viết có thể hiển thị (sau bài featured)
const visibleArticles = computed(() => {
  // Bắt đầu từ bài thứ 2 (index 1) và cắt theo itemsToShow
  return sortedNews.value.slice(1, itemsToShow.value + 1) // +1 để bù cho featured article
})

// 3. Danh sách tất cả bài viết còn lại (từ bài thứ 2)
const remainingArticles = computed(() => {
  return sortedNews.value.slice(1)
})

// ----- LOGIC ĐIỀU KHIỂN XEM THÊM -----

// Tổng số bài viết có sẵn để xem (trừ bài nổi bật)
const totalAvailable = computed(() => remainingArticles.value.length)

// Kiểm tra xem còn bài viết nào để Load More không
const hasMore = computed(() => visibleArticles.value.length < totalAvailable.value)

const loadMore = () => {
  // 🚨 Logic tính toán số lượng bài viết để thêm
  const remainingCount = totalAvailable.value - visibleArticles.value.length
  const itemsToAdd = Math.min(6, remainingCount) // Số bài hiển thị thêm
  itemsToShow.value += itemsToAdd
}

// Hành động Ẩn bớt: Quay về số lượng ban đầu
const showLess = () => {
  itemsToShow.value = INITIAL_COUNT
  // Cuộn lên đầu trang (UX tốt)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
// 4. Xử lý nội dung mô tả cho bài nổi bật (Loại bỏ HTML tag)
const plainDescription = computed(() => {
  const article = featuredArticle.value
  if (!article) return ''

  // Nếu có SEO Description thì dùng luôn
  if (article.seoDescription) return article.seoDescription

  // Nếu không, lấy Content và strip HTML tags
  if (article.content) {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = article.content
    const text = tmp.textContent || tmp.innerText || ''
    return text
  }
  return 'Đang cập nhật...'
})
</script>

<template>
  <main class="py-8 max-w-6xl mx-auto px-4 lg:px-8">
    <h1 class="text-4xl font-extrabold text-center mb-10 text-green-700 dark:text-green-400">
      Tin Tức & Sự Kiện
    </h1>

    <section v-if="featuredArticle" class="mb-12">
      <RouterLink :to="`/news/${featuredArticle.slug}`" class="block">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden md:flex">
          <div class="md:w-1/2 h-80">
            <img
              :src="featuredArticle.thumbnailUrl"
              :alt="featuredArticle.title"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="md:w-1/2 p-6 flex flex-col justify-center">
            <span class="text-xs font-semibold text-red-500 uppercase mb-2">Tin tức nổi bật</span>
            <h2
              class="text-3xl font-bold mb-3 hover:text-green-600 transition duration-200 line-clamp-2"
            >
              {{ featuredArticle.title }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {{ plainDescription }}
            </p>
            <span class="text-xs text-gray-400">
              Ngày đăng: {{ new Date(featuredArticle.publishedDate).toLocaleDateString('vi-VN') }}
            </span>
          </div>
        </div>
      </RouterLink>
    </section>

    <section class="mt-12">
      <h2
        class="text-2xl font-bold mb-6 border-b pb-2 dark:border-gray-700 text-green-700 dark:text-green-400"
      >
        Các Tin Tức Khác
      </h2>

      <div
        v-if="visibleArticles.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <NewsCard v-for="article in visibleArticles" :key="article.id" :news="article" />
      </div>

      <div v-else-if="sortedNews.length > 0" class="text-center py-10 text-gray-500">
        Không có tin tức nào khác để hiển thị.
      </div>
      <div v-else class="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
    </section>

    <div v-if="totalAvailable > INITIAL_COUNT" class="mt-10 flex justify-center space-x-4">
      <Button
        v-if="itemsToShow > INITIAL_COUNT"
        @click="showLess"
        label="Ẩn bớt"
        variant="secondary"
      />

      <Button v-if="hasMore" @click="loadMore" label="Xem thêm" variant="primary" />
    </div>
  </main>
</template>

<style scoped>
/* Để đảm bảo giới hạn số dòng cho bài viết lớn */
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
