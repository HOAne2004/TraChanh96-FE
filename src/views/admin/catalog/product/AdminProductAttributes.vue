<script setup>
import SizeManager from '@/components/admin/catalog/product/SizeManager.vue'
// Sau này thêm: import ToppingManager from ...
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Cấu hình thuộc tính sản phẩm</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div class="h-[400px]">
         <SizeManager />
      </div>

      </div>
  </div>
</template>
