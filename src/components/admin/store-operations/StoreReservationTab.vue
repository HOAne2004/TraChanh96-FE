<script setup>
import FeaturePending from '@/components/ui/FeaturePending.vue'

const props = defineProps({
  store: { type: Object, required: true }
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-10 min-h-[400px] flex items-center justify-center">
    <FeaturePending 
      title="Quản lý Đặt bàn" 
      message="Giao diện Timeline đặt bàn (Reservations) đang được phát triển."
      :show-back-button="false"
    />
  </div>
</template>
