// src/utils/formatters.js

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // 🛠️ FIX LỖI LỆCH GIỜ:
  // Kiểm tra xem chuỗi có kết thúc bằng 'Z' (ký hiệu UTC) chưa.
  // Nếu chưa, ta cộng thêm 'Z' vào để trình duyệt hiểu đây là giờ UTC.
  // Backend trả về: "2023-11-25T19:00:00" -> JS hiểu là 19h VN (Sai)
  // Sau khi fix: "2023-11-25T19:00:00Z" -> JS hiểu là 19h UTC -> Convert sang VN = 02:00 sáng (Đúng)
  if (!dateString.endsWith('Z')) {
    dateString += 'Z'
  }
  // 1. Tạo đối tượng Date (JS tự động hiểu đây là chuỗi UTC và chuyển sang local time của trình duyệt)
  const date = new Date(dateString)

  // 2. Định dạng theo chuẩn Việt Nam (bao gồm giờ)
  const options = {
    year: 'numeric',
    month: '2-digit', // Hoặc 'short'
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Dùng định dạng 24 giờ
  }

  // Dùng toLocaleString để chuyển đổi sang múi giờ local của người dùng (nếu trình duyệt của họ là VN)
  return date.toLocaleString('vi-VN', options)
}

export const formatPrice = (value) => {
  if (value === null || value === undefined) return ''

  const number = Number(value)
  if (isNaN(number)) return ''

  return number.toLocaleString('vi-VN') // 1.000.000
}
export const parsePrice = (value) => {
  if (!value) return 0

  // Bỏ dấu chấm
  const numeric = value.toString().replace(/\./g, '')
  const number = Number(numeric)

  return isNaN(number) ? 0 : number
}

export const formatSold = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  }).format(num)
}
