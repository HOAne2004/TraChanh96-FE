<script setup>
defineProps({
  order: { type: Object, required: true },
  showShipper: { type: Boolean, default: false } // Admin có thể bật cái này
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <h3 class="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Thông tin nhận hàng
    </h3>
    
    <div class="text-sm space-y-3 relative pl-3 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
      <div>
        <span class="block text-xs text-gray-400 uppercase font-bold">Người nhận</span>
        <span class="font-medium text-gray-900 dark:text-white">
          {{ order.recipientName || order.userName }} - {{ order.recipientPhone }}
        </span>
      </div>

      <div>
        <span class="block text-xs text-gray-400 uppercase font-bold">Địa chỉ</span>
        <span class="font-medium text-gray-900 dark:text-white">{{ order.shippingAddress || order.deliveryAddress }}</span>
      </div>

      <div v-if="order.userNotes">
        <span class="block text-xs text-gray-400 uppercase font-bold">Ghi chú</span>
        <span class="italic text-gray-600 dark:text-gray-300">"{{ order.userNotes }}"</span>
      </div>

      <div v-if="showShipper && order.shipperName" class="pt-3 mt-3 border-t border-dashed">
         <span class="block text-xs text-blue-500 uppercase font-bold mb-1">Shipper phụ trách</span>
         <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">S</div>
            <span class="font-bold text-gray-800">{{ order.shipperName }}</span>
            <span class="text-xs text-gray-500">({{ order.shipperPhone }})</span>
         </div>
      </div>
    </div>
  </div>
</template>