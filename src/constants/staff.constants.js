// src/constants/staff.constants.js

export const STAFF_POSITIONS = {
  OFFICE_STAFF: 1,
  FRANCHISE_CONSULTANT: 2,
  STORE_MANAGER: 10,
  BARISTA: 11,
  CASHIER: 12,
  SERVER: 13,
  SECURITY: 14
}

// Map chính xác với Backend Key và bổ sung màu sắc Badge
export const STAFF_POSITION_UI = {
  [STAFF_POSITIONS.OFFICE_STAFF]: { backendKey: 'OfficeStaff', label: 'Nhân viên Văn phòng', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  [STAFF_POSITIONS.FRANCHISE_CONSULTANT]: { backendKey: 'FranchiseConsultant', label: 'Tư vấn Nhượng quyền', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  [STAFF_POSITIONS.STORE_MANAGER]: { backendKey: 'StoreManager', label: 'Cửa hàng trưởng', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  [STAFF_POSITIONS.BARISTA]: { backendKey: 'Barista', label: 'Nhân viên Pha chế', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  [STAFF_POSITIONS.CASHIER]: { backendKey: 'Cashier', label: 'Thu ngân', color: 'bg-green-100 text-green-700 border-green-200' },
  [STAFF_POSITIONS.SERVER]: { backendKey: 'Server', label: 'Phục vụ', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  [STAFF_POSITIONS.SECURITY]: { backendKey: 'Security', label: 'Bảo vệ', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export const SALARY_TYPES = {
  FULLTIME: 1,
  PARTTIME: 2
}

export const SALARY_TYPE_UI = {
  [SALARY_TYPES.FULLTIME]: { backendKey: 'FullTime', label: 'Lương tháng (Cố định)' },
  [SALARY_TYPES.PARTTIME]: { backendKey: 'PartTime', label: 'Lương theo giờ' },
}

// Helpers để render dropdown
export const getPositionOptions = () => Object.entries(STAFF_POSITION_UI).map(([val, obj]) => ({ value: Number(val), ...obj }))
export const getSalaryTypeOptions = () => Object.entries(SALARY_TYPE_UI).map(([val, obj]) => ({ value: Number(val), ...obj }))

// Helper để lấy config UI (màu sắc, label) dựa vào Backend Key
export const getPositionConfig = (backendKey) => {
  const option = Object.values(STAFF_POSITION_UI).find(o => o.backendKey === backendKey)
  return option || { label: backendKey, color: 'bg-gray-100 text-gray-700 border-gray-200' }
}