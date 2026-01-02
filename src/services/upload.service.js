// src/services/upload.service.js
import api from './axiosClient'

const ENDPOINT = '/upload'

export default {
  /**
   * Upload file lên Server (Supabase)
   * Payload: FormData (chứa file)
   * Response: { url: "https://..." }
   */
  uploadFile(formData) {
    return api.post(ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
