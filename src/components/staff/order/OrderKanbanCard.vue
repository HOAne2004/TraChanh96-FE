<script setup>
import { computed } from 'vue';
import { ORDER_TYPE } from '@/constants/order.constants'; // Đảm bảo import đúng

const props = defineProps({
    order: { type: Object, required: true }
});

const headerColorClass = computed(() => {
    // Delivery/Mang về: Màu cam, Tại quán: Màu xanh
    return props.order.orderType === ORDER_TYPE.AT_COUNTER 
        ? 'bg-blue-100' 
        : 'bg-orange-100';
});

const formatTime = (isoString) => {
    if(!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
</script>
<template>
  <div class="bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
    
    <div class="p-3 flex justify-between items-start" 
         :class="headerColorClass">
        <div class="flex flex-col">
            <span class="font-bold text-gray-800 text-lg">
                {{ order.orderType === 1 ? (order.tableName || 'Tại quầy') : 'Mang về' }}
            </span>
            <span class="text-xs opacity-70">#{{ order.code }}</span>
        </div>
        <div class="text-right">
            <span class="text-xs font-mono font-bold bg-white/50 px-2 py-1 rounded">
                {{ formatTime(order.createdAt) }}
            </span>
        </div>
    </div>

    <div class="p-3 flex-1 overflow-y-auto max-h-60 space-y-3">
        <div v-for="item in order.items" :key="item.id" class="flex justify-between items-start border-b border-dashed border-gray-100 pb-2 last:border-0">
            <div class="flex gap-2">
                <span class="font-bold text-lg w-6 text-center text-blue-600">x{{ item.quantity }}</span>
                
                <div class="flex flex-col">
                    <span class="font-bold text-gray-800 leading-tight">{{ item.productName }}</span>
                    <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                        <span v-if="item.sizeLabel" class="bg-gray-100 px-1 rounded">{{ item.sizeLabel }}</span>
                        <span v-if="item.sugar" class="bg-gray-100 px-1 rounded">{{ item.sugar }}</span>
                        <span v-if="item.ice" class="bg-gray-100 px-1 rounded">{{ item.ice }}</span>
                    </div>
                    <p v-if="item.note" class="text-xs text-red-500 italic mt-1">"{{ item.note }}"</p>
                </div>
            </div>
        </div>
        
        <div v-if="order.userNotes" class="bg-yellow-50 p-2 rounded-lg border border-yellow-200 mt-2">
            <p class="text-xs text-yellow-800 font-bold">⚠️ Note đơn: {{ order.userNotes }}</p>
        </div>
    </div>

    <div class="p-3 border-t border-gray-100 bg-gray-50 grid grid-cols-1 gap-2">
        <slot name="actions" :order="order"></slot>
    </div>
  </div>
</template>