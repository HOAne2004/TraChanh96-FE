<script setup>
import { formatPrice, formatDate } from '@/utils/formatters'

const props = defineProps({
  order: Object,
  storeName: String,
  storeAddress: String,
  storePhone: String,
})

</script>
<template>
  <div id="invoice-pos" class="hidden-print">
    <div v-if="order" class="p-2 text-xs font-mono leading-tight">
      <div class="text-center mb-4">
        <h2 class="text-lg font-bold uppercase">{{ storeName || 'TRÀ CHANH 96' }}</h2>
        <p>{{ storeAddress }}</p>
        <p>Hotline: {{ storePhone }}</p>
        <div class="border-b border-black my-2 border-dashed"></div>
        <h3 class="text-base font-bold uppercase">HÓA ĐƠN THANH TOÁN</h3>
        <p>Mã đơn: {{ order.orderCode }}</p>
        <p>Ngày: {{ formatDate(order.createdAt) }}</p>
      </div>

      <div class="mb-4">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-black border-dashed">
              <th class="py-1">Món</th>
              <th class="py-1 text-center">SL</th>
              <th class="py-1 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.orderItems" :key="item.id">
              <td class="py-1 align-top">
                <div class="font-bold">{{ item.productName }}</div>
                <div class="text-[10px] text-gray-600">
                  {{ item.sizeName }}
                  <span v-if="item.sugarLevel">, {{ item.sugarLevel }} đường</span>
                  <span v-if="item.iceLevel">, {{ item.iceLevel }} đá</span>
                </div>
              </td>
              <td class="py-1 text-center align-top">{{ item.quantity }}</td>
              <td class="py-1 text-right align-top">{{ formatPrice(item.finalPrice) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-black border-dashed pt-2 mb-4">
        <div class="flex justify-between">
          <span>Tạm tính:</span>
          <span>{{ formatPrice(order.totalAmount) }}</span>
        </div>
        <div class="flex justify-between" v-if="order.shippingFee > 0">
          <span>Phí ship:</span>
          <span>{{ formatPrice(order.shippingFee) }}</span>
        </div>
        <div class="flex justify-between" v-if="order.discountAmount > 0">
          <span>Giảm giá:</span>
          <span>-{{ formatPrice(order.discountAmount) }}</span>
        </div>
        <div
          class="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-black border-dashed"
        >
          <span>TỔNG CỘNG:</span>
          <span>{{ formatPrice(order.grandTotal) }}</span>
        </div>
      </div>

      <div class="text-center mt-6">
        <p class="italic">Cảm ơn và hẹn gặp lại!</p>
        <p class="text-[10px]">Wifi: Tra Chanh 1996 - Pass: trachanh96</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS quan trọng để chỉ hiện khi in */
@media screen {
  .hidden-print {
    display: none;
  }
}

@media print {
  body * {
    visibility: hidden;
  }
  #invoice-pos,
  #invoice-pos * {
    visibility: visible;
  }
  #invoice-pos {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm; /* Kích thước giấy in nhiệt thông dụng */
    background: white;
    color: black;
  }
}
</style>
