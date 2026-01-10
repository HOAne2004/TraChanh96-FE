// --- USER ROLE (Khớp 100% với UserRoleEnum.cs) ---
export const USER_ROLE = {
  CUSTOMER: 1,
  ADMIN: 2,
  MANAGER: 3,
  STAFF: 4
}

export const USER_ROLE_UI = {
  [USER_ROLE.CUSTOMER]: { label: 'Khách hàng', color: 'bg-gray-100 text-gray-800' },
  [USER_ROLE.ADMIN]: { label: 'Quản trị viên', color: 'bg-purple-100 text-purple-800' },
  [USER_ROLE.MANAGER]: { label: 'Quản lý', color: 'bg-blue-100 text-blue-800' },
  [USER_ROLE.STAFF]: { label: 'Nhân viên', color: 'bg-green-100 text-green-800' }
}


// --- USER STATUS (Mapping với UserStatusEnum.cs) ---
export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  LOCKED: -1,
}

export const USER_STATUS_UI = {
  [USER_STATUS.ACTIVE]: { label: 'Hoạt động', color: 'text-green-600 bg-green-50 border-green-200' },
  [USER_STATUS.INACTIVE]: { label: 'Ngừng hoạt động', color: 'text-gray-600 bg-gray-50 border-gray-200' },
  [USER_STATUS.LOCKED]: { label: 'Đã khóa', color: 'text-red-600 bg-red-50 border-red-200' },
}

// Helper lấy label
export const getUserRoleConfig = (roleId) => USER_ROLE_UI[roleId] || { label: 'Unknown', color: '' }
