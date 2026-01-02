<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import Button from '@/components/common/Button.vue'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()
const isMenuOpen = ref(false)
const closeMenu = () => {
  isMenuOpen.value = false
}
const props = defineProps({
  placeholder: { type: String, default: 'Viết bình luận của bạn...' },
  loading: { type: Boolean, default: false },
  // Nút hủy dùng cho form Reply
  showCancel: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const userStore = useUserStore()
const router = useRouter()
const content = ref('')

const handleSubmit = () => {
  if (!content.value.trim()) return
  emit('submit', content.value)
  content.value = '' // Reset sau khi gửi
}
const handleLogin = () => {
  modalStore.openLoginModal()
  closeMenu()
}
</script>

<template>
  <div class="flex gap-4 items-start animate-fade-in">
    <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
      <img
        v-if="userStore.user?.avatar"
        :src="userStore.user.avatar"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div class="flex-1">
      <div v-if="userStore.isLoggedIn">
        <textarea
          v-model="content"
          rows="2"
          :placeholder="placeholder"
          class="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all text-sm"
          :disabled="loading"
        ></textarea>

        <div class="mt-2 flex justify-end gap-2">
          <button
            v-if="showCancel"
            @click="$emit('cancel')"
            class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
            :disabled="loading"
          >
            Hủy
          </button>

          <Button
            :label="loading ? 'Đang gửi...' : 'Gửi bình luận'"
            size="sm"
            :disabled="loading || !content.trim()"
            @click="handleSubmit"
          />
        </div>
      </div>

      <div v-else class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
        <p class="text-sm text-gray-500 mb-2">Vui lòng đăng nhập để tham gia bình luận</p>
        <div class="flex justify-center gap-3">
            <Button label="Đăng nhập" size="sm" variant="outline" @click="handleLogin" />
            <Button label="Đăng ký" size="sm" @click="router.push('/register')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
