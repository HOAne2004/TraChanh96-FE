// src/stores/upload.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import uploadService from '@/services/upload.service'

export const useUploadStore = defineStore('upload', () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Hành động Upload file
   * @param {File} file - Đối tượng File lấy từ input[type="file"]
   * @returns {Promise<string>} - Trả về đường dẫn URL của ảnh
   */
  async function uploadFileAction(file) {
    loading.value = true
    error.value = null

    try {
      // 1. Tạo FormData để gói file
      const formData = new FormData()
      formData.append('file', file) // Key 'file' phải khớp với tham số trong Controller (IFormFile file)

      // 2. Gọi API
      const response = await uploadService.uploadFile(formData)

      // 3. Trả về URL
      return response.data.url
    } catch (err) {
      console.error(err)
      error.value = err.response?.data || 'Lỗi tải ảnh lên'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    uploadFileAction
  }
})
