<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { useModalStore } from '@/stores/modal'
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

        <CustomerActivityTabs
            :user-id="user.id"
            :user-public-id="user.publicId"
        />
      </div>

      <div class="lg:col-span-1 space-y-6">
        <CustomerMembershipCard :user="user" />
      </div>
    </div>
  </div>
</template>
