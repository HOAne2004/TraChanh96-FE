// 🟢 [Fix] Chuyển về số để khớp với filter và backend (dự đoán)
export const REVIEW_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DELETED: 'Deleted',
}

export const REVIEW_STATUS_UI = {
  [REVIEW_STATUS.PENDING]: {
    label: 'Chờ xét duyệt',
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  [REVIEW_STATUS.APPROVED]: {
    label: 'Đã duyệt',
    color: 'bg-green-100 text-green-800 border border-green-200',
  },
  [REVIEW_STATUS.REJECTED]: {
    label: 'Đã từ chối',
    color: 'bg-red-100 text-red-800 border border-red-200',
  },
  [REVIEW_STATUS.DELETED]: {
    label: 'Đã bị xóa',
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
  },
}

// --- HELPER FUNCTIONS ---

/**
 * Lấy danh sách options cho Select/Dropdown (Filter hoặc Modal)
 * excludeDeleted: Có muốn ẩn trạng thái "Đã xóa" khỏi list chọn không?
 */
export const getReviewStatusOptions = (excludeDeleted = false) => {
  return Object.entries(REVIEW_STATUS_UI)
    .filter(([key]) => !excludeDeleted || String(key) !== REVIEW_STATUS.DELETED)
    .map(([key, config]) => ({
      value: String(key),
      label: config.label,
    }))
}

// Lấy config hiển thị từ giá trị status
export const getReviewStatusConfig = (status) => {
  return (
    REVIEW_STATUS_UI[status] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
  )
}
