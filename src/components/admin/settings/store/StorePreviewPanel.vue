<script setup>
import StoreDetailView from '@/views/customer/StoreDetailView.vue'

const props = defineProps({
  previewData: {
    type: Object,
    required: true
  },
  form: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="hidden xl:flex flex-1 h-full bg-gray-100 items-center justify-center relative p-8 overflow-hidden">
    <div
      class="absolute inset-0 opacity-10"
      style="
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 20px 20px;
      "
    ></div>

    <!-- LAPTOP FRAME -->
    <div
      class="relative bg-gray-800 rounded-t-xl shadow-2xl border-[4px] border-gray-800 w-full max-w-[1024px] h-[85vh] flex flex-col"
    >
      <!-- Laptop Camera/Header -->
      <div class="h-6 bg-gray-800 flex justify-center items-center shrink-0">
        <div class="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
      </div>

      <!-- Browser Toolbar -->
      <div class="h-10 bg-white border-b border-gray-200 flex items-center px-3 gap-2 shrink-0">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div
          class="flex-1 bg-gray-100 rounded-md h-7 ml-4 flex items-center px-3 text-xs text-gray-500 font-mono"
        >
          https://drinking.vn/stores/{{ form.name ? 'preview' : '...' }}
        </div>
      </div>

      <!-- Screen Content -->
      <div class="flex-1 bg-white overflow-y-auto relative no-scrollbar rounded-b-lg">
        <StoreDetailView :store-data="previewData" :is-preview="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
