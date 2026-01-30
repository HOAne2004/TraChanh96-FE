<script setup>
import { computed } from 'vue'
import { resolveImage } from '@/utils/image'
import defaultImage from '@/assets/images/others/default-drink.png'
import StoreFilter from '@/components/customer/StoreFilter.vue'

const props = defineProps({
  product: { type: Object, required: true },
  stores: { type: Array, default: () => [] },
  selectedStoreId: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:selectedStoreId'])

const productImage = computed(() => resolveImage(props.product?.imageUrl, defaultImage))

const handleImageError = (e) => {
  e.target.src = defaultImage
  e.target.onerror = null
}
</script>

<template>
  <div class="space-y-4">
    <div class="aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative group">
      <img
        :src="productImage"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="handleImageError"
      />
      <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-500 shadow-md flex items-center gap-1">
        <span>{{ product.totalRating || 5.0 }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
          <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <StoreFilter
      :stores="stores"
      :model-value="selectedStoreId"
      @update:model-value="emit('update:selectedStoreId', $event)"
    />
  </div>
</template>
