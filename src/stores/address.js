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
    const defaultAddress = computed(() => {
        return addresses.value.find(addr => addr.isDefault) || null
    })

    const sortedAddresses = computed(() => {
        return [...addresses.value].sort((a, b) => {
            if (a.isDefault) return -1
            if (b.isDefault) return 1
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    })

    // --- ACTIONS (USER CONTEXT) ---

    async function fetchAddresses() {
        const userStore = useUserStore()
        if (!userStore.isLoggedIn) return

        loading.value = true
        try {
            const res = await addressService.getAll() // Gọi API User
            addresses.value = res // Service đã .data rồi
        } catch (err) {
            console.error('Lỗi tải danh sách địa chỉ:', err)
        } finally {
            loading.value = false
        }
    }

    // Dùng cho User hoặc khi tạo Store mới (chưa có StoreId)
    async function createAddress(payload) {
        loading.value = true
        try {
            const res = await addressService.create(payload)
            // Cập nhật UI ngay lập tức
            addresses.value.unshift(res)

            if (payload.isDefault) {
                addresses.value.forEach(addr => {
                    if (addr.id !== res.id) addr.isDefault = false
                })
            }
            return res // Trả về để form lấy ID
        } catch (err) {
            console.error('Lỗi tạo địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateAddress(id, payload) {
        loading.value = true
        try {
            const res = await addressService.update(id, payload)
            const index = addresses.value.findIndex(a => a.id === id)
            if (index !== -1) addresses.value[index] = res

            if (payload.isDefault) {
                addresses.value.forEach(addr => {
                     addr.isDefault = (addr.id === id)
                })
            }
            return res
        } catch (err) {
            console.error('Lỗi cập nhật địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteAddress(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return

        loading.value = true
        try {
            await addressService.delete(id)
            addresses.value = addresses.value.filter(a => a.id !== id)
        } catch (err) {
            console.error('Lỗi xóa địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function setDefault(id) {
        loading.value = true
        try {
            await addressService.setDefault(id)
            addresses.value.forEach(addr => {
                addr.isDefault = (addr.id === id)
            })
        } catch (err) {
            console.error('Lỗi đặt mặc định:', err)
        } finally {
            loading.value = false
        }
    }

    // --- ACTIONS (STORE CONTEXT - ADMIN ONLY) ---
    // Các hàm này KHÔNG update vào state 'addresses' để tránh lẫn lộn với địa chỉ cá nhân

    async function createStoreAddress(payload) {
        loading.value = true
        try {
            // Payload phải có storeId
            const res = await addressService.createForStore(payload)
            return res
        } catch (err) {
            console.error('Lỗi tạo địa chỉ:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateStoreAddress(id, payload) {
        loading.value = true
        try {
            const res = await addressService.updateForStore(id, payload)
            return res
        } catch (err) {
            console.error('Lỗi cập nhật địa chỉ:', err)
            throw err
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
        setDefault,
        // Export thêm các hàm cho store
        createStoreAddress,
        updateStoreAddress
    }
})
