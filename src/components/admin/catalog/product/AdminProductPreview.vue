<script setup>
import { ref } from 'vue'
import ProductCard from '@/components/customer/card/ProductCard.vue'
import defaultDrinkImage from '@/assets/images/others/default-drink.png'
import { formatPrice } from '@/utils/formatters'

const props = defineProps({
  previewProduct: { type: Object, required: true, default: () => ({}) },
  showToppingInfo: { type: Boolean, default: true },
})

const previewTab = ref('detail')
</script>

<template>
  <div class="sticky top-6">
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
    >
      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 class="font-bold text-gray-700 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Live Preview
        </h3>
        <div class="flex bg-gray-200 rounded-lg p-1">
          <button
            @click="previewTab = 'card'"
            :class="
              previewTab === 'card'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            "
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
          >
            Card
          </button>
          <button
            @click="previewTab = 'detail'"
            :class="
              previewTab === 'detail'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            "
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
          >
            Chi tiết
          </button>
        </div>
      </div>

      <div class="p-8 bg-gray-100 min-h-[600px] flex justify-center items-start overflow-y-auto">
        <div v-if="previewTab === 'card'" class="w-[240px] transform scale-110 mt-10">
          <ProductCard :product="previewProduct" />
        </div>

        <div
          v-else
          class="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              class="aspect-square rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative group"
            >
              <img
                :src="previewProduct.imageUrl || defaultDrinkImage"
                class="w-full h-full object-contain"
              />
              <div
                class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
              >
                HOT
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <span class="text-green-600 font-bold uppercase text-xs tracking-wider">{{
                  previewProduct.categoryName
                }}</span>
                <h1 class="text-3xl font-bold text-gray-800 mt-1 mb-2">
                  {{ previewProduct.name }}
                </h1>
                <div class="text-2xl font-extrabold text-green-600">
                  {{ formatPrice(previewProduct.basePrice) }} đ
                </div>
              </div>

              <div class="space-y-3">
                <p class="text-sm font-medium text-gray-700">Chọn kích cỡ:</p>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-if="!previewProduct.availableSizes?.length"
                    class="text-sm text-gray-400 italic"
                  >
                    Mặc định
                  </div>
                  <button
                    v-for="s in previewProduct.availableSizes"
                    :key="s.id"
                    class="px-4 py-2 border rounded-lg text-sm hover:border-green-500 hover:text-green-600 transition-colors"
                  >
                    {{ s.name }}
                    <span
                      v-if="s.priceOverride && s.priceOverride - previewProduct.basePrice > 0"
                      class="text-xs text-gray-500 ml-1"
                    >
                      (+{{ formatPrice(s.priceOverride - previewProduct.basePrice) }})
                    </span>
                  </button>
                </div>
              </div>

              <div
                v-if="showToppingInfo"
                class="space-y-3 pt-4 border-t border-gray-100 border-dashed"
              >
                <p class="text-sm font-medium text-gray-700">Topping đi kèm (Demo):</p>
                <div class="text-xs text-gray-500 italic">
                  {{
                    previewProduct.allowedToppingIds?.length
                      ? `Đã chọn ${previewProduct.allowedToppingIds.length} loại topping`
                      : 'Chưa cấu hình topping'
                  }}
                </div>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <h4 class="font-bold text-gray-800 mb-2">Mô tả</h4>
                <div
                  class="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                  v-html="
                    previewProduct.description ||
                    '<p class=\'italic text-gray-400\'>Chưa có mô tả...</p>'
                  "
                ></div>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <h4 class="font-bold text-gray-800 mb-2">Thành phần</h4>
                <div
                  class="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                  v-html="
                    previewProduct.ingredient ||
                    '<p class=\'italic text-gray-400\'>Chưa có thông tin thành phần</p>'
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style tùy chỉnh cho nội dung HTML từ Editor nếu không dùng Tailwind Typography */
:deep(p) {
  margin-bottom: 0.5em;
}
:deep(ul),
:deep(ol) {
  padding-left: 1.2em;
  margin-bottom: 0.5em;
}
:deep(li) {
  list-style-type: disc;
}
</style>
