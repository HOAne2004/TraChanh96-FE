// src/constants/store.constant.js

// Map StoreStatusEnum từ Backend (.NET)
export const STORE_STATUS = {
  COMING_SOON: 'ComingSoon',
  ACTIVE: 'Active',
  TEMPORARILY_CLOSED: 'TemporarilyClosed',
  PERMANENTLY_CLOSED: 'PermanentlyClosed',
  DELETED: 'Deleted',
}

// Config hiển thị
export const STORE_STATUS_UI = {
  [STORE_STATUS.COMING_SOON]: {
    label: 'Chờ ngày khai trương',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [STORE_STATUS.ACTIVE]: {
    label: 'Đang hoạt động',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  [STORE_STATUS.TEMPORARILY_CLOSED]: {
    label: 'Tạm thời đóng cửa',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [STORE_STATUS.PERMANENTLY_CLOSED]: {
    label: 'Đã đóng cửa vĩnh viễn',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [STORE_STATUS.DELETED]: {
    label: 'Đã bị xóa',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
}

// --- HELPER FUNCTIONS ---

// Lấy danh sách status cho filter
export const getStoreStatusOptions = () => {
  return Object.entries(STORE_STATUS_UI).map(([key, config]) => ({
    value: String(key),
    label: config.label,
  }))
}

// Lấy config từ status
export const getStoreStatusConfig = (status) => {
  return (
    STORE_STATUS_UI[status] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    }
  )
}
