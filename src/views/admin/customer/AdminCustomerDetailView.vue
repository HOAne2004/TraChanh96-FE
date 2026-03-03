<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useModalStore } from '@/stores/modal'
import authService from '@/services/auth.service'
import FormHeader from '@/components/admin/common/FormHeader.vue'
import { USER_STATUS } from '@/constants/user.constants'

// 🟢 Đảm bảo đường dẫn này đúng với cấu trúc folder của bạn
import CustomerProfileCard from '@/components/admin/users/CustomerProfileCard.vue'
import CustomerMembershipCard from '@/components/admin/users/CustomerMembershipCard.vue'
import CustomerActivityTabs from '@/components/admin/users/CustomerActivityTabs.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()
const modalStore = useModalStore()

const user = ref(null)
const loading = ref(false)
const userId = route.params.id

// --- ACTIONS ---
const fetchData = async () => {
  loading.value = true
  try {
    const res = await userStore.fetchUserDetail(userId)
    user.value = res
  } catch (err) {
    toast.show({ type: 'error', message: 'Không tìm thấy khách hàng' })
    router.push({ name: 'admin.customers' })
  } finally {
    loading.value = false
  }
}

// Hàm toggle status giữ nguyên logic của bạn (nhớ logic 'active'/'locked' chữ thường ở Backend)
const handleToggleStatus = async () => {
  if (!user.value) return
  const isLocked = user.value.status === USER_STATUS.LOCKED
  const actionText = isLocked ? 'Mở khóa' : 'Khóa'

  const confirmed = await modalStore.confirmAction(
    `Bạn có chắc muốn ${actionText} tài khoản này?`,
    'Xác nhận thay đổi trạng thái',
  )

  if (confirmed) {
    try {
      // Gọi action toggleUserStatus mà ta đã sửa ở bước trước (nhận object user)
      const res = await userStore.toggleUserStatus(user.value)
      user.value.status = res
      toast.show({ type: 'success', message: `Đã ${actionText} thành công` })
    } catch (err) {
      toast.show({ type: 'error', message: 'Lỗi cập nhật trạng thái' })
    }
  }
}

// Hàm gửi lại mã xác thực
const isSendingVerification = ref(false)
const handleResendVerification = async () => {
  if (!user.value || !user.value.email) return

  isSendingVerification.value = true
  try {
    await authService.resendVerification({ email: user.value.email })
    toast.show({ type: 'success', message: 'Gửi mã xác nhận thành công' })
  } catch (err) {
    toast.show({ type: 'error', message: err.response?.data?.message || 'Gửi mã thất bại' })
  } finally {
    isSendingVerification.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-if="loading && !user" class="p-20 text-center text-gray-500">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
  </div>

  <div v-else-if="user" class="px-6 min-h-screen bg-gray-50">
    <FormHeader
      :title="user.username"
      :description="`Mã khách hàng: ${user.publicId}`"
      :hide-submit="true"
      back-label="Quay lại"
    >
      <template #actions>
        <button
          v-if="user.emailVerified === false"
          @click="handleResendVerification"
          :disabled="isSendingVerification"
          class="px-4 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isSendingVerification"
            class="animate-spin h-4 w-4 text-blue-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isSendingVerification ? 'Đang gửi...' : 'Gửi lại mã xác nhận' }}
        </button>
        <button
          @click="handleToggleStatus"
          :class="[
            'px-4 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors',
            user.status === USER_STATUS.LOCKED
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-white text-red-600 border-gray-300 hover:bg-red-50',
          ]"
        >
          {{ user.status === USER_STATUS.LOCKED ? 'Mở khóa tài khoản' : 'Khóa tài khoản' }}
        </button>
      </template>
    </FormHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <CustomerProfileCard :user="user" @refresh="fetchData" />

        <CustomerActivityTabs :user-id="user.id" :user-public-id="user.publicId" />
      </div>

      <div class="lg:col-span-1 space-y-6">
        <CustomerMembershipCard :user="user" />
      </div>
    </div>
  </div>
</template>
