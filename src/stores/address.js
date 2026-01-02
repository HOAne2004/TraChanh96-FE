// src/stores/address.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import addressService from '@/services/address.service'
import { useUserStore } from '@/stores/user'

export const useAddressStore = defineStore('address', () => {
    // --- STATE ---
    const addresses = ref([])
    const loading = ref(false)
    const error = ref(null)

    // --- GETTERS ---
    
    // Lấy địa chỉ mặc định (nếu có)
    const defaultAddress = computed(() => {
        return addresses.value.find(addr => addr.isDefault) || null
    })

    // Sắp xếp địa chỉ: Mặc định lên đầu, còn lại theo thời gian tạo mới nhất
    const sortedAddresses = computed(() => {
        return [...addresses.value].sort((a, b) => {
            if (a.isDefault) return -1
            if (b.isDefault) return 1
            // Sắp xếp theo ngày tạo giảm dần (mới nhất lên trên)
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    })

    // --- ACTIONS ---

    /**
     * Lấy danh sách địa chỉ
     */
    async function fetchAddresses() {
        const userStore = useUserStore()
        if (!userStore.isLoggedIn) return

        loading.value = true
        error.value = null
        try {
            const res = await addressService.getAll()
            addresses.value = res.data
        } catch (err) {
            console.error('Lỗi tải danh sách địa chỉ:', err)
            error.value = err.response?.data || 'Lỗi tải địa chỉ'
        } finally {
            loading.value = false
        }
    }

    /**
     * Tạo mới địa chỉ
     * @param {Object} payload - AddressCreateDto
     */
    async function createAddress(payload) {
        loading.value = true
        try {
            const res = await addressService.create(payload)
            // Thêm vào đầu danh sách client để cập nhật UI ngay
            addresses.value.unshift(res.data)
            
            // Nếu địa chỉ mới là mặc định, cần cập nhật lại các cái cũ thành false
            if (payload.isDefault) {
                addresses.value.forEach(addr => {
                    if (addr.id !== res.data.id) addr.isDefault = false
                })
            }
            return true
        } catch (err) {
            console.error('Lỗi tạo địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Cập nhật địa chỉ
     */
    async function updateAddress(id, payload) {
        loading.value = true
        try {
            const res = await addressService.update(id, payload)
            // Cập nhật lại trong mảng local
            const index = addresses.value.findIndex(a => a.id === id)
            if (index !== -1) {
                addresses.value[index] = res.data
            }

            // Xử lý logic hiển thị nếu set default
            if (payload.isDefault) {
                addresses.value.forEach(addr => {
                     addr.isDefault = (addr.id === id)
                })
            }
            return true
        } catch (err) {
            console.error('Lỗi cập nhật địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Xóa địa chỉ
     */
    async function deleteAddress(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return

        loading.value = true
        try {
            await addressService.delete(id)
            // Xóa khỏi mảng local
            addresses.value = addresses.value.filter(a => a.id !== id)
        } catch (err) {
            console.error('Lỗi xóa địa chỉ:', err)
            alert('Không thể xóa địa chỉ này')
        } finally {
            loading.value = false
        }
    }

    /**
     * Đặt làm mặc định
     */
    async function setDefault(id) {
        loading.value = true
        try {
            await addressService.setDefault(id)
            
            // Cập nhật state local: Set tất cả false, set id này true
            addresses.value.forEach(addr => {
                addr.isDefault = (addr.id === id)
            })
        } catch (err) {
            console.error('Lỗi đặt mặc định:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        addresses,
        loading,
        error,
        defaultAddress,
        sortedAddresses,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefault
    }
})