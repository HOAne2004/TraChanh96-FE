// src/constants/status.constants.js

// Map PublicStatusEnum từ Backend (.NET)
export const PUBLIC_STATUS = {
  PENDING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
  DELETED: 99
}

// Config hiển thị (Label & Màu sắc)
// Lưu ý: Key ở đây là số (Enum value)
export const PUBLIC_STATUS_UI = {
  [PUBLIC_STATUS.PENDING]: {
    label: 'Chờ xử lý',
    value: 1,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  },
  [PUBLIC_STATUS.ACTIVE]: {
    label: 'Hoạt động',
    value: 2,
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  [PUBLIC_STATUS.INACTIVE]: {
    label: 'Tạm dừng',
    value: 3,
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  },
  // Không đưa DELETED vào UI Dropdown để tránh user chọn nhầm
}

// Helper: Chuyển đổi từ String (API trả về) sang Number (Để logic FE xử lý)
// Ví dụ: "Active" -> 2
export const mapLabelToValue = (label) => {
  if (!label) return null
  // Tìm key trong UI object có label khớp
  const found = Object.values(PUBLIC_STATUS_UI).find(u => u.label === label || u.label.toLowerCase() === label.toLowerCase())
  if (found) return found.value

  // Fallback: Map cứng nếu API trả về tiếng Anh
  const map = { 'Active': 2, 'Inactive': 3, 'Pending': 1 }
  return map[label] || null
}

// Helper: Lấy danh sách Options cho thẻ <select>
export const getPublicStatusOptions = () => {
  return Object.values(PUBLIC_STATUS_UI)
}
