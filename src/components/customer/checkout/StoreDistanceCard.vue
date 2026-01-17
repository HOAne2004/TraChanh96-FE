<script setup>
import { computed } from 'vue'
import { formatDistance } from '@/utils/distance'

const props = defineProps({
  store: { type: Object, required: true },
  distanceKm: { type: Number, default: 0 },
  isOutOfRadius: { type: Boolean, default: false },
  mode: { type: String, default: 'full' } // 'full' (Delivery) | 'simple' (Pickup)
})

const estimatedTime = computed(() => {
  if (!props.distanceKm) return '---'
  // 15p chuẩn bị + 3p/km
  const min = 15 + Math.ceil(props.distanceKm * 3)
  return `${min} - ${min + 10} phút`
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
    <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>

    <div class="flex-1">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase font-bold mb-1">
            {{ mode === 'simple' ? 'Đến lấy tại cửa hàng' : 'Cửa hàng phục vụ' }}
          </p>
          <h3 class="font-bold text-gray-800 dark:text-white">{{ store.name }}</h3>
          <p class="text-xs text-gray-500 line-clamp-1">{{ store.address }}</p>
        </div>

        <div class="text-right" v-if="!isOutOfRadius && distanceKm > 0">
           <p class="text-sm font-bold text-green-600">{{ formatDistance(distanceKm) }}</p>
           <p class="text-xs text-gray-500">~{{ estimatedTime }}</p>
        </div>
      </div>

      <div v-if="isOutOfRadius" class="mt-2 bg-red-50 text-red-600 text-xs p-2 rounded border border-red-100 flex items-center gap-2 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Khoảng cách quá xa (Giới hạn {{ store.deliveryRadius }}km).
      </div>
    </div>
  </div>
</template>
