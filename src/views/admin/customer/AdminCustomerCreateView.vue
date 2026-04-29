<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/identity/user.store'
import { useToastStore } from '@/stores/system/toast.store'
import FormHeader from '@/components/admin/common/FormHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()

const loading = ref(false)
// 🟢 Thêm state để quản lý ẩn/hiện mật khẩu
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  roleId: 'Customer',
})

const handleCreate = async () => {
  if (formData.password !== formData.confirmPassword) {
    return toast.show({ type: 'error', message: 'Mật khẩu xác nhận không khớp' })
  }

  loading.value = true
  try {
    await userStore.createCustomer(formData)
    toast.show({ type: 'success', message: 'Tạo khách hàng thành công' })
    router.push({ name: 'admin.customer.list' })
  } catch (err) {
    // Error handler
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <FormHeader
      title="Thêm Khách hàng"
      description="Tạo tài khoản khách hàng mới"
      :loading="loading"
      submit-label="Lưu Khách hàng"
      @submit="handleCreate"
    ></FormHeader>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <form @submit.prevent="handleCreate" autocomplete="off">
        <input type="email" style="display: none" />
        <input type="password" style="display: none" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Tên hiển thị <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.username"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="VD: Nguyen Van A"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input
              v-model="formData.phone"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="09xxxxxxx"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Email (Tên đăng nhập) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.email"
              type="email"
              autocomplete="new-password"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Mật khẩu <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.574-2.9m3.1-2.33A9.993 9.993 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.21 2.375M3 3l18 18"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none pr-10"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  v-if="showConfirmPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.574-2.9m3.1-2.33A9.993 9.993 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.21 2.375M3 3l18 18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
