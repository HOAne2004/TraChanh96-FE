// src/stores/admin.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import adminService from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'

export const useAdminStore = defineStore('admin', () => {
  // --- STATE ---
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---

  async function fetchAllUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await adminService.getAllUsers()
      users.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Lỗi tải danh sách người dùng'
    } finally {
      loading.value = false
    }
  }

  async function updateUserAction(publicId, updateDto) {
    const toast = useToastStore()
    loading.value = true
    error.value = null

    try {
      const response = await adminService.updateUser(publicId, updateDto)
      const updatedUser = response.data

      const index = users.value.findIndex(u => u.publicId === publicId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updatedUser }
      }

      toast.show({
        type: 'success',
        message: 'Cập nhật người dùng thành công',
      })

      return true
    } catch (err) {
      const message = err.response?.data?.message || 'Cập nhật thất bại'
      error.value = message

      toast.show({
        type: 'error',
        message,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUserAction(publicId) {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    const toast = useToastStore()
    loading.value = true
    error.value = null

    try {
      await adminService.deleteUser(publicId)

      users.value = users.value.filter(u => u.publicId !== publicId)

      toast.show({
        type: 'success',
        message: 'Xóa người dùng thành công',
      })

      return true
    } catch (err) {
      const message = err.response?.data?.message || 'Xóa thất bại'
      error.value = message

      toast.show({
        type: 'error',
        message,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    updateUserAction,
    deleteUserAction,
  }
})
