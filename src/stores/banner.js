// src/stores/banner.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import bannerService from '@/services/banner.service'

export const useBannerStore = defineStore('banner', () => {
    // --- STATE ---
    const banners = ref([]) // Lưu tất cả banner fetch về
    const loading = ref(false)
    const error = ref(null)

    // --- ACTIONS ---

    /**
     * Fetch banner theo vị trí
     * @param {String} position - (Optional) Lọc theo vị trí (VD: 'Home-Top')
     */
    async function fetchBanners(position = null) {
        loading.value = true
        error.value = null
        try {
            const res = await bannerService.getAll(position)
            
            // Controller trả về danh sách đã lọc active, ta chỉ việc lưu
            // Nếu muốn quản lý nhiều vị trí cùng lúc, có thể cần chiến lược lưu state khác (dạng Map),
            // nhưng với app đơn giản thì lưu đè hoặc concat tùy logic UI.
            // Ở đây mình lưu đè để hiển thị cho component gọi nó.
            banners.value = res.data
        } catch (err) {
            console.error('Lỗi tải banner:', err)
            error.value = 'Không thể tải dữ liệu banner'
        } finally {
            loading.value = false
        }
    }

    /**
     * [ADMIN] Tạo mới
     */
    async function createBanner(payload) {
        loading.value = true
        try {
            const res = await bannerService.create(payload)
            // Thêm vào list hiện tại nếu khớp logic hiển thị
            banners.value.push(res.data) 
            return res.data
        } catch (err) {
            console.error('Lỗi tạo banner:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * [ADMIN] Xóa
     */
    async function deleteBanner(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return

        loading.value = true
        try {
            await bannerService.delete(id)
            banners.value = banners.value.filter(b => b.id !== id)
        } catch (err) {
            alert('Lỗi khi xóa banner')
        } finally {
            loading.value = false
        }
    }

    return {
        banners,
        loading,
        error,
        fetchBanners,
        createBanner,
        deleteBanner
    }
})