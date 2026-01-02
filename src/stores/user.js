// src/stores/user.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/auth.service'
import userService from '@/services/user.service'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
    // --- STATE ---
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const token = ref(localStorage.getItem('token') || null)
    const refreshToken = ref(localStorage.getItem('refreshToken') || null)
    const loading = ref(false)
    const error = ref(null)

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

            // ⭐️ FIX: Kiểm tra xem BE trả về key tên là gì
            console.log('Login Response:', res.data)

            // Hỗ trợ cả accessToken (thường) và AccessToken (hoa) hoặc token
            const accessToken = res.data.accessToken || res.data.token || res.data.AccessToken
            const refreshTokenVal = res.data.refreshToken || res.data.RefreshToken

            if (!accessToken) {
                throw new Error('Không tìm thấy AccessToken trong phản hồi!')
            }

            // Lưu token ngay lập tức
            setUserData(null, accessToken, refreshTokenVal)

            // Sau khi có token mới gọi lấy profile
            await fetchUserProfile()

        } catch (err) {
            console.error('Lỗi login:', err)
            error.value = err.response?.data?.message || 'Đăng nhập thất bại'
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
                password: payload.password
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
            // Chỉ logout nếu lỗi là 401 thật sự từ BE chứ không phải do mạng
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
        // Nếu dùng Modal thì không cần redirect cứng, nhưng để đảm bảo an toàn:
        if (router.currentRoute.value.meta.requiresAuth) {
            router.push('/')
        }
    }

    return {
        user,
        token,
        loading,
        error,
        isLoggedIn,
        isAdmin,
        login,
        register,
        logout,
        fetchUserProfile
    }
})
