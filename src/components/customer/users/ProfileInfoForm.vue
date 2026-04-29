<script setup>
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/identity/user.store'
import { useModalStore } from '@/stores/system/modal.store'
import Button from '@/components/ui/Button.vue'
import { formatPrice } from '@/utils/formatters'

const userStore = useUserStore()
const modalStore = useModalStore()

const props = defineProps({
  user: { type: Object, required: true },
})

const form = ref({
  username: props.user.username || props.user.userusername,
  email: props.user.email,
  phone: props.user.phone,
  detailAddress: props.user.detailAddress || '',
})
const isSaving = ref(false)

// --- STATE CHO MODAL MEMBERSHIP ---
const isMembershipModalOpen = ref(false)

// Cập nhật form
watch(
  () => props.user,
  (newVal) => {
    form.value.username = newVal.username || newVal.userusername
    form.value.phone = newVal.phone
    form.value.email = newVal.email
    form.value.detailAddress = newVal.detailAddress || ''
  },
  { immediate: true },
)

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const updateData = {
      username: form.value.username,
      detailAddress: form.value.detailAddress,
    }
    await userStore.updateUser(props.user.publicId || props.user.id, updateData)
    modalStore.showToast('Cập nhật thông tin thành công!', 'success')
    await userStore.fetchUserProfile()
  } catch (error) {
    modalStore.showToast('Lỗi khi cập nhật thông tin.', 'error')
  } finally {
    isSaving.value = false
  }
}

// --- LOGIC TÍNH TOÁN HẠNG THÀNH VIÊN ---
const membershipInfo = computed(() => props.user?.membership || {})
const currentLevel = computed(() => membershipInfo.value.level || {})

// UI Colors dựa theo tên hạng
const tierStyles = computed(() => {
  const name = currentLevel.value.name?.toLowerCase() || 'đồng'
  if (name.includes('vàng') || name.includes('gold')) {
    return {
      bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
    }
  }
  if (name.includes('bạc') || name.includes('silver')) {
    return {
      bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
      text: 'text-gray-800',
      border: 'border-gray-300',
    }
  }
  if (name.includes('kim cương') || name.includes('diamond')) {
    return {
      bg: 'bg-gradient-to-r from-cyan-400 to-blue-600',
      text: 'text-blue-800',
      border: 'border-blue-300',
    }
  }
  // Mặc định: Đồng / Member
  return {
    bg: 'bg-gradient-to-r from-orange-400 to-red-500',
    text: 'text-orange-800',
    border: 'border-orange-300',
  }
})

// Tính toán % thanh Kinh nghiệm (EXP)
// LƯU Ý: Bạn cần Backend trả về thêm thông tin 'nextLevelMinCoins' hoặc tự lấy danh sách Level về để so sánh.
// Ở đây tôi làm logic giả lập nếu Backend chưa có.
const expPercentage = computed(() => {
  const currentCoins = membershipInfo.value.currentCoins || 0
  const nextLevelCoins = currentLevel.value.nextLevelMinCoins || 1000 // Fake data, thay bằng data thật từ BE

  if (currentCoins >= nextLevelCoins) return 100
  return Math.floor((currentCoins / nextLevelCoins) * 100)
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative"
  >
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b dark:border-gray-700 pb-6 gap-6"
    >
      <div>
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thông tin cá nhân</h3>
        <p class="text-gray-500 text-sm">Quản lý thông tin và hạng thành viên của bạn</p>
      </div>

      <button
        @click="isMembershipModalOpen = true"
        class="w-full lg:w-auto text-left group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        :class="tierStyles.bg"
      >
        <div
          class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"
        ></div>

        <div class="relative z-10 flex items-center justify-between gap-6 text-white">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Thành viên</p>
            <h4 class="text-xl font-extrabold flex items-center gap-2">
              👑 {{ currentLevel.name || 'Khách hàng mới' }}
            </h4>
          </div>
          <div class="text-right">
            <p class="text-xs font-medium opacity-80 mb-1">Số dư Xu</p>
            <p class="text-2xl font-black">{{ membershipInfo.currentCoins || 0 }}</p>
          </div>
        </div>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="username"
            class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >Họ và Tên <span class="text-red-500">*</span></label
          >
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >Số điện thoại</label
          >
          <div class="relative">
            <input
              id="phone"
              :value="form.phone"
              type="text"
              disabled
              class="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div class="md:col-span-2">
          <label for="email" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >Email đăng nhập</label
          >
          <input
            id="email"
            :value="form.email"
            type="email"
            disabled
            class="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t dark:border-gray-700">
        <Button
          type="submit"
          :label="isSaving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'"
          variant="primary"
          size="lg"
          :disabled="isSaving"
          class="w-full md:w-auto px-8"
        />
      </div>
    </form>

    <div
      v-if="isMembershipModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="isMembershipModalOpen = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in"
      >
        <button
          @click="isMembershipModalOpen = false"
          class="absolute top-4 right-4 z-20 p-1 bg-black/20 text-white rounded-full hover:bg-black/40 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="pt-8 pb-6 px-6 relative" :class="tierStyles.bg">
          <div class="text-center text-white relative z-10 mb-6">
            <p class="text-sm opacity-90 mb-1">Khách hàng thân thiết</p>
            <h2 class="text-2xl font-bold">Chào mừng {{ form.username }},</h2>
            <p class="text-sm mt-1">
              Bạn là thành viên hạng
              <span class="font-bold uppercase">{{ currentLevel.name }}</span>
            </p>
          </div>

          <div
            class="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-5 text-white shadow-inner"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-[10px] uppercase opacity-70">Mã thẻ (Card Code)</p>
                <p class="font-mono text-lg tracking-widest">
                  {{ membershipInfo.cardCode || 'Đang cập nhật' }}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-8 h-8 opacity-50"
              >
                <path
                  d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75a1.875 1.875 0 0 1-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V3h-1.875Z"
                />
                <path
                  fill-rule="evenodd"
                  d="M3 15a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v4.5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5V15Zm6.75 2.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="text-[10px] uppercase opacity-70">Tổng chi tiêu tích lũy</p>
              <p class="font-bold text-xl">
                {{ formatPrice?.(membershipInfo.totalSpent) || membershipInfo.totalSpent + ' đ' }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-gray-50 dark:bg-gray-800">
          <div
            class="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm mb-6 -mt-10 relative z-20 border border-gray-100 dark:border-gray-600"
          >
            <p class="text-center text-sm text-gray-600 dark:text-gray-300 font-medium mb-3">
              Tiến trình lên hạng <span class="font-bold text-gray-900 dark:text-white">BẠC</span>
            </p>

            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-2">
              <div
                class="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                :style="`width: ${expPercentage}%`"
              ></div>
            </div>

            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>{{ membershipInfo.currentCoins || 0 }} Xu</span>
              <span>1000 Xu</span>
            </div>

            <p class="text-center text-xs text-gray-500 mt-3">
              Tích lũy thêm
              <span class="font-bold text-green-600"
                >{{ 1000 - (membershipInfo.currentCoins || 0) }} Xu</span
              >
              để thăng hạng!
            </p>
          </div>

          <div
            class="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-600"
          >
            <h4
              class="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-600"
            >
              Thứ hạng hiện tại có gì?
            </h4>

            <ul class="space-y-4">
              <li class="flex gap-3 items-start">
                <div
                  class="mt-0.5 p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">Ưu đãi độc quyền</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ currentLevel.benefits || 'Đang cập nhật quyền lợi' }}
                  </p>
                </div>
              </li>

              <li class="flex gap-3 items-start">
                <div
                  class="mt-0.5 p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">Tỷ lệ tích lũy Xu</p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Tỷ lệ quy đổi: {{ currentLevel.pointEarningRate || 0 }} (Cứ 100đ =
                    {{ (currentLevel.pointEarningRate || 0) * 100 }} xu)
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes scaleIn {
  0% {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
