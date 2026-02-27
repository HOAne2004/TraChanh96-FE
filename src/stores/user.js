// src/stores/user.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/auth.service'
import userService from '@/services/user.service'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // --- STATE ---
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const users = ref([])
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    pageIndex: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  })

  // --- COMPUTED ---
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => {
    if (!user.value || !user.value.role) return false
    return user.value.role.toLowerCase() === 'admin'
  })

  // --- ACTIONS ---
  function setUserData(userData, accessToken, refreshTokenData = null) {
    if (userData) {
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    }
    if (accessToken) {
      token.value = accessToken
      localStorage.setItem('token', accessToken)
    }
    if (refreshTokenData) {
      refreshToken.value = refreshTokenData
      localStorage.setItem('refreshToken', refreshTokenData)
    }
  }

  function clearUserData() {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  /**
   * LOGIN
   */
  async function login(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)

      console.log('Login Response:', res.data)

      if (res.data.success === false) {
        throw new Error(res.data.message || 'Đăng nhập thất bại')
      }

      const tokenData = res.data.data ? res.data.data : res.data

      const accessToken = tokenData.accessToken || tokenData.token || tokenData.AccessToken
      const refreshTokenVal = tokenData.refreshToken || tokenData.RefreshToken

      if (!accessToken) {
        throw new Error('Không tìm thấy AccessToken trong phản hồi!')
      }

      setUserData(null, accessToken, refreshTokenVal)

      await fetchUserProfile()
    } catch (err) {
      console.error('Lỗi login:', err)

      error.value = err.response?.data?.message || err.message || 'Đăng nhập thất bại'

      throw err
    } finally {
      loading.value = false
    }
  }
  /**
   * REGISTER
   */
  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      await authService.register(payload)
      await login({
        email: payload.email,
        password: payload.password,
      })
    } catch (err) {
      error.value = err.response?.data?.message || 'Đăng ký thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * LẤY PROFILE
   */
  async function fetchUserProfile() {
    if (!token.value) return

    try {
      const response = await userService.getMe()
      setUserData(response.data, null, null)
    } catch (err) {
      console.error('Lỗi lấy thông tin user:', err)
      if (err.response && err.response.status === 401) {
        logout()
      }
    }
  }

  /**
   * LOGOUT
   */
  function logout() {
    clearUserData()
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push('/')
    }
  }
  async function fetchUsers(params = {}) {
    loading.value = true
    try {
      const res = await userService.getAll(params)
      users.value = res.data.items || []
      pagination.value = {
        pageIndex: res.data.pageIndex,
        pageSize: res.data.pageSize,
        totalRecords: res.data.totalRecords,
        totalPages: res.data.totalPages,
      }
    } catch (err) {
      console.error(err)
      users.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchUserDetail(id) {
    loading.value = true
    try {
      const res = await userService.getById(id)
      return res.data
    } catch (err) {
      console.error('Error get detail user: ', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * [ADMIN] Tạo khách hàng (Chỉ tạo, KHÔNG tự đăng nhập)
   */
  async function createCustomer(payload) {
    loading.value = true
    error.value = null
    try {
      await authService.register(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'Tạo khách hàng thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, data) {
    loading.value = true
    try {
      const res = await userService.update(id, data)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Cập nhật khách hàng thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleUserStatus(targetUser) {
    loading.value = true
    try {
      const isLocked = targetUser.status === 'locked'
      const newStatus = isLocked ? 'active' : 'locked'

      const payload = {
        username: targetUser.username,
        email: targetUser.email,
        phone: targetUser.phone,
        thumbnailUrl: targetUser.thumbnailUrl,
        roleId: targetUser.role,
        status: newStatus,
      }

      const res = await userService.update(targetUser.publicId, payload)

      return res.data.status
    } catch (err) {
      console.error(err)
      error.value = err.response?.data?.message || 'Thay đổi trạng thái thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    users,
    token,
    loading,
    error,
    pagination,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchUserProfile,
    fetchUsers,
    fetchUserDetail,
    updateUser,
    toggleUserStatus,
    createCustomer,
  }
})
