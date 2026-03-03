// src/utils/image.js
export const resolveImage = (imagePath, defaultImage) => {
  if (!imagePath) return defaultImage

  // 🟢 THÊM DÒNG NÀY: Nếu là Base64 (data:image...) hoặc http (link tuyệt đối) -> Giữ nguyên
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath
  }

  // Logic cũ (nối domain backend)
  return `${import.meta.env.VITE_API_URL}/${imagePath}`
}
