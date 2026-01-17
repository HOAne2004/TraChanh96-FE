<script setup>
import QrcodeVue from 'qrcode.vue'
import Button from '@/components/common/Button.vue'

defineProps({
  show: Boolean,
  pickupCode: { type: String, default: '' }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-scale-in text-center border border-gray-100 dark:border-gray-700">

        <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
          Mã Nhận Đồ
        </h3>
        <p class="text-gray-500 text-sm mb-6">
          Đưa mã này cho nhân viên để nhận món
        </p>

        <div class="flex justify-center mb-6">
          <div class="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
             <QrcodeVue
              :value="pickupCode"
              :size="200"
              level="H"
              render-as="svg"
              foreground="#2563eb"
            />
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg py-3 px-4 mb-6 border border-gray-100 dark:border-gray-600 border-dashed">
          <span class="block text-xs text-gray-400 uppercase font-semibold mb-1">Mã xác thực</span>
          <span class="text-3xl font-black text-gray-800 dark:text-white tracking-[0.2em]">
            {{ pickupCode }}
          </span>
        </div>

        <Button
          label="Đóng"
          variant="secondary"
          class="w-full"
          @click="emit('close')"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
