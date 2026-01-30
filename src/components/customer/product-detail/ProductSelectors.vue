<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import { resolveImage } from '@/utils/image'
import defaultImage from '@/assets/images/others/default-drink.png'
import { SUGAR_OPTIONS, ICE_OPTIONS } from '@/constants/enums'

const props = defineProps({
  isDrink: { type: Boolean, default: true },
  sizes: { type: Array, default: () => [] },
  availableToppings: { type: Array, default: () => [] },
  selectedSize: { type: Object, default: null },
  selectedSugar: { type: Number, default: null },
  selectedIce: { type: Number, default: null },
  selectedToppings: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:selectedSize',
  'update:selectedSugar',
  'update:selectedIce',
  'toggle-topping'
])
</script>

<template>
  <div v-if="isDrink" class="space-y-6 mb-8">
    <hr class="border-gray-200 dark:border-gray-700 mb-6" />

    <div v-if="sizes?.length > 0">
      <span class="block text-sm font-semibold mb-2">Kích cỡ</span>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="size in sizes"
          :key="size.id"
          @click="emit('update:selectedSize', size)"
          class="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
          :class="selectedSize?.id === size.id ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500'"
        >
          {{ size.label }}
          <span v-if="size.priceModifier > 0" class="text-xs ml-1 text-gray-500">(+{{ formatPrice(size.priceModifier) }})</span>
        </button>
      </div>
    </div>

    <div>
      <span class="block text-sm font-semibold mb-2">Độ ngọt</span>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="level in SUGAR_OPTIONS"
          :key="level.id"
          @click="emit('update:selectedSugar', level.id)"
          :class="['px-4 py-2 rounded-lg border text-sm font-medium transition-all', selectedSugar === level.id ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500']"
        >
          {{ level.label }}
        </button>
      </div>
    </div>

    <div>
      <span class="block text-sm font-semibold mb-2">Lượng đá</span>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="level in ICE_OPTIONS"
          :key="level.id"
          @click="emit('update:selectedIce', level.id)"
          :class="['px-4 py-2 rounded-lg border text-sm font-medium transition-all', selectedIce === level.id ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-500']"
        >
          {{ level.label }}
        </button>
      </div>
    </div>

    <div v-if="availableToppings.length > 0">
      <span class="block text-sm font-semibold mb-2">Thêm Topping</span>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="t in availableToppings"
          :key="t.id"
          @click="emit('toggle-topping', t)"
          class="flex items-center p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm"
          :class="selectedToppings.some((s) => s.id === t.id) ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'"
        >
          <div class="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
            <img :src="resolveImage(t.imageUrl, defaultImage)" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ t.name }}</p>
            <p class="text-xs text-gray-500">+{{ formatPrice(t.basePrice) }}</p>
          </div>
          <div class="w-5 h-5 rounded-full border flex items-center justify-center" :class="selectedToppings.some((s) => s.id === t.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'">
             <svg v-if="selectedToppings.some((s) => s.id === t.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
