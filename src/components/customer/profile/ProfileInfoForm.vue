<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import Button from '@/components/common/Button.vue'

const userStore = useUserStore()
const modalStore = useModalStore()

const props = defineProps({
  user: { type: Object, required: true },
})

// Dùng ref để chỉnh sửa bản sao dữ liệu
const form = ref({
  name: props.user.name,
  phone: props.user.phone,
  address: props.user.address || '',
})
const isSaving = ref(false)

// Cập nhật form khi prop user thay đổi
watch(
  () => props.user,
  (newVal) => {
    form.value.name = newVal.name
    form.value.phone = newVal.phone
    form.value.address = newVal.address || ''
  },
  { immediate: true },
)

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const updateData = {
      name: form.value.name,
      address: form.value.address,
      // Không cho phép chỉnh sửa phone/role/password ở form này
    }

    // 🚨 Cần tạo action 'updateUserAction' trong userStore
    await userStore.updateUserAction(props.user.id, updateData)

    modalStore.showToast('Cập nhật thông tin thành công!', 'success')
  } catch (error) {
    modalStore.showToast('Lỗi khi cập nhật thông tin.', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <h3 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Thông tin cá nhân</h3>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium mb-1">Họ và Tên</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium mb-1">Số điện thoại</label>
        <input
          id="phone"
          :value="form.phone"
          type="text"
          disabled
          class="w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
        />
        <p class="text-xs text-gray-500 mt-1">
          Số điện thoại dùng để đăng nhập, không thể chỉnh sửa.
        </p>
      </div>

      <div>
        <label for="address" class="block text-sm font-medium mb-1"
          >Địa chỉ giao hàng mặc định</label
        >
        <textarea
          id="address"
          v-model="form.address"
          rows="3"
          placeholder="Địa chỉ chi tiết (VD: Số nhà, tên đường, Phường/Xã)"
          class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>

      <Button
        type="submit"
        :label="isSaving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'"
        variant="primary"
        size="lg"
        :disabled="isSaving"
        class="w-full"
      />
    </form>
  </div>
</template>
