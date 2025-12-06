<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/common/Button.vue'

// Import ảnh (Đảm bảo bạn đã tạo folder và thêm ảnh như bài trước)
import imgCart from '@/assets/images/empty-states/empty-cart.png'
import imgSearch from '@/assets/images/empty-states/empty-search.png'
import imgOrder from '@/assets/images/empty-states/empty-order.png'
import imgDefault from '@/assets/images/others/error-404.png'

const props = defineProps({
  // 'cart', 'search', 'order', 'default'
  type: { type: String, default: 'default' },
  title: { type: String, default: 'Chưa có dữ liệu' },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  // Route để điều hướng (VD: '/menu')
  actionRoute: { type: String, default: '' }
})

// Sự kiện custom click (nếu không dùng route)
const emit = defineEmits(['action-click'])
const router = useRouter()

const imageSrc = computed(() => {
  switch (props.type) {
    case 'cart': return imgCart
    case 'search': return imgSearch
    case 'order': return imgOrder
    default: return imgDefault
  }
})

const handleAction = () => {
  // Ưu tiên emit sự kiện nếu component cha muốn xử lý logic riêng
  emit('action-click')

  // Nếu có route và không bị chặn bởi cha, chuyển trang
  if (props.actionRoute) {
    router.push(props.actionRoute)
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center w-full animate-fade-in">
    <div class="w-64 h-64 mb-6 relative group">
      <div class="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
      <img
        :src="imageSrc"
        :alt="title"
        class="w-full h-full object-contain relative z-10 drop-shadow-sm hover:scale-105 transition-transform duration-500"
      />
    </div>

    <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
      {{ title }}
    </h3>

    <p v-if="message" class="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-base leading-relaxed">
      {{ message }}
    </p>

    <div v-if="actionLabel">
      <Button
        :label="actionLabel"
        variant="primary"
        size="lg"
        :rounded="true"
        @click="handleAction"
        class="shadow-lg shadow-green-500/20 px-8"
      />
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
