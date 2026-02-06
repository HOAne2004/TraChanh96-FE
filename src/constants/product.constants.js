export const PRODUCT_STATUS = {
DRAFT: 'Draft',
ACTIVE: 'Active',
INACTIVE: 'Inactive',
OUT_OF_STOCK: 'OutOfStock',
DELETED: 'Deleted',

}
export const PRODUCT_TYPE = {
  DRINK: 'Drink',
  FOOD: 'Food',
  TOPPING: 'Topping',
}
export const PRODUCT_STATUS_UI = {
  [PRODUCT_STATUS.DRAFT]: {
    label: 'Bản nháp',
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
  },
  [PRODUCT_STATUS.ACTIVE]: {
    label: 'Hoạt động',
    color: 'bg-green-100 text-green-800 border border-green-200',
  },
  [PRODUCT_STATUS.INACTIVE]: {
    label: 'Không hoạt động',
    color: 'bg-red-100 text-red-800 border border-red-200',
  },
  [PRODUCT_STATUS.OUT_OF_STOCK]: {
    label: 'Hết hàng',
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  [PRODUCT_STATUS.DELETED]: {
    label: 'Đã xóa',
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
  },
}

export const PRODUCT_TYPE_UI = {
  [PRODUCT_TYPE.DRINK]: {
    label: 'Đồ uống',
    color: 'bg-green-100 text-green-800 border border-green-200',
  },
  [PRODUCT_TYPE.FOOD]: {
    label: 'Đồ ăn',
    color: 'bg-red-100 text-red-800 border border-red-200',
  },
  [PRODUCT_TYPE.TOPPING]: {
    label: 'Topping',
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
}
export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_UI).map(([key, config]) => ({
  value: String(key),
  label: config.label,
}))

export const getProductStatusOptions = (excludeDeleted = false) => {
  return Object.entries(PRODUCT_STATUS_UI)
    .filter(([key]) => !excludeDeleted || String(key) !== PRODUCT_STATUS.DELETED)
    .map(([key, config]) => ({
      value: String(key),
      label: config.label,
    }))
}

export const getProductStatusConfig = (status) => {
  return (
    PRODUCT_STATUS_UI[status] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
  )
}

// 🟢 [MỚI] Helper lấy danh sách Options cho Filter
export const getProductTypeOptions = () => {
  return Object.entries(PRODUCT_TYPE_UI).map(([key, config]) => ({
    value: key,
    label: config.label,
  }))
}

// 🟢 [MỚI] Helper lấy Config hiển thị (Màu sắc)
export const getProductTypeConfig = (type) => {
  return (
    PRODUCT_TYPE_UI[type] || {
      label: type || 'Khác',
      color: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
  )
}

// Danh sách Slug (hoặc Tên) các danh mục ĐƯỢC PHÉP có topping
export const NO_TOPPING_CATEGORIES = [
  'ca-phe',
  'topping',
  'banh-ngot',
  'do-an-nhanh',
  'combo'
]

// Hàm helper kiểm tra
export const canHaveTopping = (categorySlug) => {
  if (!categorySlug) return true // Mặc định cho hiện nếu chưa chọn danh mục
  return !NO_TOPPING_CATEGORIES.includes(categorySlug)
}