import api from './index'

const uploadApi = {
  async uploadImage(file, onProgress = null) {
    // Validate file
    if (!(file instanceof File)) {
      throw new Error('File không hợp lệ.')
    }

    // Validate file type (image)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP).')
    }

    // Validate file size (ví dụ 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('Kích thước file không được vượt quá 5MB.')
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 seconds timeout
      }

      // Thêm progress tracking nếu có callback
      if (onProgress && typeof onProgress === 'function') {
        config.onUploadProgress = (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          )
          onProgress(percent)
        }
      }

      const response = await api.post('api/upload', formData, config)

      // Validate response
      if (!response?.data?.url) {
        throw new Error('Server không trả về URL hợp lệ.')
      }

      // Xử lý base URL an toàn
      const baseURL = api.defaults.baseURL || window.location.origin
      let base = baseURL

      // Remove /api suffix if present
      if (baseURL.endsWith('/api')) {
        base = baseURL.slice(0, -4)
      } else if (baseURL.match(/\/api\/?$/)) {
        base = baseURL.replace(/\/api\/?$/, '')
      }

      // Đảm bảo URL hợp lệ
      const imageUrl = response.data.url
      const separator = imageUrl.startsWith('/') ? '' : '/'
      const fullUrl = `${base}${separator}${imageUrl}`

      // Validate final URL
      try {
        new URL(fullUrl) // Ném lỗi nếu không hợp lệ
      } catch {
        console.warn('URL trả về không hợp lệ:', fullUrl)
        return imageUrl // Trả về relative URL nếu absolute không hợp lệ
      }

      return fullUrl

    } catch (err) {
      console.error('❌ Lỗi upload hình ảnh:', err)

      // Xử lý lỗi chi tiết hơn
      if (err.response) {
        // Server trả lỗi
        const errorMsg = err.response.data?.message ||
                        err.response.data?.error ||
                        `Server error: ${err.response.status}`
        throw new Error(errorMsg)
      } else if (err.request) {
        // Không nhận được response
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra mạng.')
      } else if (err.code === 'ECONNABORTED') {
        // Timeout
        throw new Error('Upload quá thời gian chờ. Vui lòng thử lại.')
      } else {
        // Lỗi khác
        throw new Error(err.message || 'Tải ảnh lên thất bại.')
      }
    }
  },
}

export default uploadApi
