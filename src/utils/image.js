// src/utils/image.js
export const resolveImage = (imagePath, defaultImage) => {
  if (!imagePath) return defaultImage

  // Giữ nguyên nếu đã là URL tuyệt đối hoặc Base64
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath
  }

  // 1. Lấy Base URL và loại bỏ đuôi '/api' (nếu có)
  // Biến https://localhost:7030/api -> https://localhost:7030
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }

  // 2. Xử lý dấu '/' để tránh tình trạng URL bị //uploads/...
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${cleanPath}`;
}
