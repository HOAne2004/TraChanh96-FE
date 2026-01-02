<script setup>
import TitledContainer from '@/components/customer/TitledContainer.vue'
import { computed } from 'vue'

const props = defineProps({
  policy: {
    type: Object,
    default: () => null,
  },
})

// Nếu policy là null hoặc không có content
const hasContent = computed(() => props.policy && (props.policy.content || props.policy.title))
</script>

<template>
  <TitledContainer :title="policy.title" controls="hidden" v-if="hasContent">
    <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">

      <div v-if="policy.content" v-html="policy.content"></div>

      <div v-else class="space-y-2">
         <ul class="list-disc pl-5 space-y-1">
            <li><strong>Thời gian giao hàng:</strong> 30 - 60 phút</li>
            <li><strong>Phí ship:</strong> 15.000đ (Freeship đơn > 200k)</li>
            <li><strong>Hotline hỗ trợ:</strong> 1900 1234</li>
         </ul>
      </div>

    </div>
  </TitledContainer>
</template>
