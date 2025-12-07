<script setup>
import { computed } from 'vue'
import defaultStoreImg from '@/assets/images/others/default-news.jpg'

const props = defineProps({
  store: { type: Object, required: true },
})

// Xử lý ảnh
const fullImageUrl = computed(() => {
  const url = props.store.imageUrl
  if (!url) return defaultStoreImg
  if (url.startsWith('http')) return url
  return `https://trachanh96-be-production.up.railway.app${url}`
})

// Xử lý giờ mở cửa (Cắt bỏ giây nếu có)
const formatTime = (timeString) => {
  if (!timeString) return '...'
  return timeString.substring(0, 5) // "08:00:00" -> "08:00"
}

const link = computed(() => `/stores/${props.store.id}`)
</script>

<template>
  <div
    class="flex-shrink-0 w-80 snap-start bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-600 group"
  >
    <router-link :to="link" class="block h-full flex flex-col">
      <div class="relative h-48 overflow-hidden">
        <img
          :src="fullImageUrl"
          :alt="store.name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          @error="(e) => (e.target.src = defaultStoreImg)"
        />

        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8"
        >
          <div class="flex items-center text-white text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 mr-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ formatTime(store.openTime) }} - {{ formatTime(store.closeTime) }}
          </div>
        </div>
      </div>

      <div class="p-5 flex flex-col gap-2">
        <h4 class="font-bold text-gray-900 dark:text-white text-lg">
          {{ store.name }}
        </h4>

        <div class="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span class="line-clamp-2">{{ store.address }}</span>
        </div>

        <a
          :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`"
          target="_blank"
          class="mt-3 w-full text-center py-2 rounded-lg bg-gray-100 hover:bg-green-50 text-green-700 font-semibold text-sm transition-colors border border-transparent hover:border-green-200"
        >
          Chỉ đường
        </a>
      </div>
    </router-link>
  </div>
</template>
