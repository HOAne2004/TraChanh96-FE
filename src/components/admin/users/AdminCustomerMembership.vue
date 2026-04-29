<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { useToastStore } from '@/stores/system/toast.store'

const props = defineProps({
  user: { type: Object, required: true },
})

const toast = useToastStore()

// Tính % tiến độ (Logic giả lập, bạn có thể thay bằng store helper)
const rankProgress = computed(() => {
  if (!props.user.membership) return 0
  const total = Number(props.user.membership.totalSpent || 0)
  const nextRankTarget = 5000000
  return Math.min((total / nextRankTarget) * 100, 100)
})

const handleAdjustPoints = async () => {
  toast.show({ type: 'warn', message: 'Tính năng đang phát triển' })
}
const showHistory = () => {
  toast.show({ type: 'warn', message: 'Tính năng đang phát triển' })
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
      ></div>
      <div class="relative z-10">
        <div class="flex justify-between items-start mb-8">
          <div class="text-xs font-bold uppercase tracking-widest opacity-70">
            Drinking Membership
          </div>
          <div
            class="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 rounded text-xs font-bold uppercase"
          >
            {{ user.membership?.levelName || 'Thành viên' }}
          </div>
        </div>
        <div class="mb-2">
          <div class="text-3xl font-mono tracking-widest">
            {{ user.membership?.cardCode || 'NO-CARD' }}
          </div>
          <div class="text-xs opacity-60 mt-1">Mã thẻ thành viên</div>
        </div>
        <div class="flex justify-between items-end mt-6">
          <div>
            <div class="text-xs opacity-70 uppercase">Điểm tích lũy</div>
            <div class="text-xl font-bold text-yellow-400">{{ user.currentCoins || 0 }} xu</div>
          </div>
          <div class="text-right">
            <div class="text-xs opacity-70 uppercase">Tổng chi tiêu</div>
            <div class="font-bold">{{ formatPrice(user.membership?.totalSpent || 0) }} đ</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h4 class="font-bold text-gray-800 mb-3">Quản lý hạng & Điểm</h4>
      <div class="mb-4">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-gray-500">Tiến độ thăng hạng</span>
          <span class="font-bold text-green-600">{{ rankProgress.toFixed(0) }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${rankProgress}%` }"
          ></div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          @click="handleAdjustPoints"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700 opacity-50 cursor-not-allowed"
        >
          Điều chỉnh điểm
        </button>
        <button
          @click="showHistory"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-700 opacity-50 cursor-not-allowed"
        >
          Lịch sử hạng
        </button>
      </div>
    </div>
  </div>
</template>
