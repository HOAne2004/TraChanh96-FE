// src/stores/admin.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // 👈 Thêm computed
import adminService from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { USER_ROLE } from '@/constants/user.constants'

export const useAdminStore = defineStore('admin', () => {
  // --- STATE ---
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- GETTERS (COMPUTED) ---

  // 1. Lấy danh sách những người có thể đi giao hàng (Shipper Candidates)
  // Bao gồm: Shipper, Staff, và cả Admin/Manager (để test hoặc quản lý đi giao hộ)
  const shippers = computed(() => {
    return users.value.filter((u) => {
      // Logic tương tự: Ai không phải khách hàng thì đều có thể đi ship
      return u.role !== USER_ROLE.CUSTOMER
    })
  })
  // 2. Lấy danh sách nhân viên nội bộ (Staff + Manager + Admin) - Không bao gồm Customer
  const internalUsers = computed(() => {
    return users.value.filter((u) => {
      const role = (u.role || '').toLowerCase()
      return role !== 'customer'
    })
  })

  // 3. Lấy danh sách khách hàng
  const customers = computed(() => {
    return users.value.filter((u) => (u.role || '').toLowerCase() === 'customer')
  })

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

      const index = users.value.findIndex((u) => u.publicId === publicId)
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

      users.value = users.value.filter((u) => u.publicId !== publicId)

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
    shippers, // 👈 Export getter này
    internalUsers, // 👈 Export getter này
    customers, // 👈 Export getter này
    loading,
    error,
    fetchAllUsers,
    updateUserAction,
    deleteUserAction,
  }
})
