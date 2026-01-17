<script setup>
import { formatPrice } from '@/utils/formatters'

const props = defineProps({
  loading: Boolean,
  isValid: Boolean, // Thay disabled bằng isValid để điều khiển style
  total: Number,
  label: { type: String, default: 'ĐẶT HÀNG' }
})

const emit = defineEmits(['submit'])
</script>

<template>
  <button
    @click="$emit('submit')"
    :disabled="loading"
    class="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
    :class="!isValid || loading
      ? 'bg-gray-400 shadow-none cursor-not-allowed opacity-80'
      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-200'"
  >
    <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>

    <span>{{ label }} • {{ formatPrice(total) }}</span>
  </button>
</template>
