// src/stores/option.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import sizeService from '@/services/size.service'
import { SUGAR_LEVELS, ICE_LEVELS } from '@/constants/productOptions'

export const useOptionStore = defineStore('option', () => {
    // --- STATE ---
    const sizes = ref([])      // Danh sách sizes từ API
    const sugarLevels = ref(SUGAR_LEVELS) // Load từ file constant
    const iceLevels = ref(ICE_LEVELS)     // Load từ file constant

    const loading = ref(false)
    const error = ref(null)

    // --- ACTIONS (Chỉ cần cho Size vì Sugar/Ice là tĩnh) ---

    /**
     * Fetch Sizes (Dùng cho khách hàng - chỉ Active)
     */
    async function fetchSizes() {
        loading.value = true
        try {
            const response = await sizeService.getAll()
            sizes.value = response.data
        } catch (err) {
            console.error('Lỗi tải sizes:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch Sizes (Dùng cho Admin - All)
     */
    async function fetchSizesForAdmin() {
        loading.value = true
        try {
            const response = await sizeService.getAllAdmin()
            sizes.value = response.data
        } catch (err) {
            error.value = 'Lỗi tải danh sách size quản trị'
        } finally {
            loading.value = false
        }
    }

    /**
     * Tạo Size mới
     */
    async function createSizeAction(createDto) {
        loading.value = true
        error.value = null
        try {
            const response = await sizeService.create(createDto)
            // Thêm vào danh sách hiện tại
            sizes.value.push(response.data)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Tạo size thất bại'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Cập nhật Size
     */
    async function updateSizeAction(id, updateDto) {
        loading.value = true
        error.value = null
        try {
            const response = await sizeService.update(id, updateDto)
            const updatedSize = response.data

            // Tìm và replace trong mảng
            const index = sizes.value.findIndex(s => s.id === id)
            if (index !== -1) {
                sizes.value[index] = updatedSize
            }
            return updatedSize
        } catch (err) {
            error.value = err.response?.data?.message || 'Cập nhật size thất bại'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Xóa Size (Có kiểm tra usage trước)
     */
    async function deleteSizeAction(id) {
        loading.value = true
        error.value = null
        try {
            // 1. Kiểm tra xem có sản phẩm nào đang dùng size này không
            const checkRes = await sizeService.checkUsage(id)
            const usageCount = checkRes.data.count

            if (usageCount > 0) {
                throw new Error(`Không thể xóa. Size này đang được dùng trong ${usageCount} sản phẩm.`)
            }

            // 2. Nếu không có ai dùng -> Xóa thật
            if (!confirm('Bạn chắc chắn muốn xóa kích cỡ này?')) return

            await sizeService.delete(id)

            // Xóa khỏi mảng
            sizes.value = sizes.value.filter(s => s.id !== id)
            return true

        } catch (err) {
            error.value = err.message || err.response?.data?.message || 'Xóa thất bại'
            throw err // Ném lỗi ra để Component hiển thị Toast
        } finally {
            loading.value = false
        }
    }

    return {
        sizes,
        sugarLevels,
        iceLevels,
        loading,
        error,
        fetchSizes,
        fetchSizesForAdmin,
        createSizeAction,
        updateSizeAction,
        deleteSizeAction
    }
})
