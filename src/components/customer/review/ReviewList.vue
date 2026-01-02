<script setup>
import { resolveImage } from '@/utils/image'
import defaultAvatar from '@/assets/images/others/default-drink.png'

defineProps({
  reviews: Array
})

const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN')
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Đánh giá từ khách hàng</h3>

    <div v-if="reviews.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
        Chưa có đánh giá nào. Hãy là người đầu tiên!
    </div>

    <div v-else class="grid gap-6">
       <div v-for="review in reviews" :key="review.id" class="border-b border-gray-100 pb-6 last:border-0">
          <div class="flex items-center gap-3 mb-2">
             <img :src="resolveImage(review.userThumbnailUrl, defaultAvatar)" class="w-10 h-10 rounded-full object-cover" />
             <div>
                <p class="font-bold text-sm text-gray-900 dark:text-white">{{ review.userName }}</p>
                <div class="flex text-yellow-400 text-xs">
                   <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
                </div>
             </div>
             <span class="text-xs text-gray-400 ml-auto">{{ formatDate(review.createdAt) }}</span>
          </div>

          <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">{{ review.content }}</p>

          <img v-if="review.mediaUrl" :src="review.mediaUrl" class="mt-3 w-24 h-24 object-cover rounded-lg border" />

          <div v-if="review.adminResponse" class="mt-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs">
             <p class="font-bold text-green-700 mb-1">Phản hồi từ Cửa hàng:</p>
             <p class="text-gray-600 dark:text-gray-400">{{ review.adminResponse }}</p>
          </div>
       </div>
    </div>
  </div>
</template>
