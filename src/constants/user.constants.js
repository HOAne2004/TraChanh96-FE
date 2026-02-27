// src/constants/user.constants.js

// --- 1. USER ROLE ---
export const USER_ROLE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
}

export const USER_ROLE_UI = {
  [USER_ROLE.CUSTOMER]: { label: 'Khách hàng', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  [USER_ROLE.ADMIN]: { label: 'Quản trị viên', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  [USER_ROLE.MANAGER]: { label: 'Quản lý', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [USER_ROLE.STAFF]: { label: 'Nhân viên', color: 'bg-green-100 text-green-800 border-green-200' },
}

// --- 2. USER STATUS ---
export const USER_STATUS = {
  ACTIVE: 'active',
  LOCKED: 'locked',
  DELETED: 'deleted',
}

export const USER_STATUS_UI = {
  [USER_STATUS.ACTIVE]: {
    label: 'Hoạt động',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: 'CheckCircleIcon'
  },
  [USER_STATUS.LOCKED]: {
    label: 'Đã khóa',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
  [USER_STATUS.DELETED]: {
    label: 'Đã xóa',
    color: 'text-gray-400 bg-gray-100 border-gray-200 line-through',
  }
}

// --- 3. HELPERS ---

/**
 * Lấy config hiển thị cho Role (Label + Color)
 */
export const getUserRoleConfig = (roleId) => {
  // Fallback an toàn nếu roleId null hoặc không khớp
  return USER_ROLE_UI[roleId] || { label: roleId || 'Unknown', color: 'bg-gray-50 text-gray-500' }
}

/**
 * Lấy config hiển thị cho Status (Label + Color)
 */
export const getUserStatusConfig = (status) => {
  return USER_STATUS_UI[status] || { label: status || 'Unknown', color: 'bg-gray-50 text-gray-500' }
}

/**
 * Lấy danh sách Options cho thẻ Select (Filter)
 * @param {boolean} excludeDeleted - Có loại bỏ trạng thái Deleted không
 */
export const getUserStatusOptions = (excludeDeleted = false) => {
  return Object.values(USER_STATUS) // Lấy mảng các giá trị ['Active', 'Inactive', ...]
    .filter((status) => !excludeDeleted || status !== USER_STATUS.DELETED)
    .map((status) => ({
      value: status,
      label: USER_STATUS_UI[status]?.label || status,
    }))
}

// Helper cho Role Options (nếu cần filter theo Role hoặc tạo User mới)
export const getUserRoleOptions = () => {
    return Object.values(USER_ROLE).map(role => ({
        value: role,
        label: USER_ROLE_UI[role]?.label || role
    }))
}
