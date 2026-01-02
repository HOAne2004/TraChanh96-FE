// src/constants/order.constants.js

// Map OrderStatusEnum từ Backend (.NET)
export const ORDER_STATUS = {
  PENDING_PAYMENT: 0,
  NEW: 1,
  CONFIRMED: 2,
  PREPARING: 3,
  READY: 4,
  DELIVERING: 5,
  COMPLETED: 6,
  CANCELLED: 7,
  RECEIVED: 8,
  DELETED: 99,
}

// Config hiển thị (Bổ sung đầy đủ theo BE)
export const ORDER_STATUS_UI = {
  // 0: PENDING_PAYMENT (Thiếu trong code cũ!)
  [ORDER_STATUS.PENDING_PAYMENT]: {
    label: 'Chờ thanh toán',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    iconPath:
      'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },

  // 1: NEW
  [ORDER_STATUS.NEW]: {
    label: 'Mới',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },

  // 2: CONFIRMED
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Đã xác nhận',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },

  // 3: PREPARING
  [ORDER_STATUS.PREPARING]: {
    label: 'Đang chuẩn bị',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconPath:
      'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z',
  },

  // 4: READY
  [ORDER_STATUS.READY]: {
    label: 'Sẵn sàng',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    iconPath:
      'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  },

  // 5: DELIVERING
  [ORDER_STATUS.DELIVERING]: {
    label: 'Đang giao hàng',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconPath:
      'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.767',
  },

  // 6: COMPLETED
  [ORDER_STATUS.COMPLETED]: {
    label: 'Đã hoàn thành',
    color: 'bg-green-100 text-green-700 border-green-200',
    iconPath:
      'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
  },

  // 7: CANCELLED
  [ORDER_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 border-red-200',
    iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },

  // 8: RECEIVED
  [ORDER_STATUS.RECEIVED]: {
    label: 'Đã nhận hàng',
    color: 'bg-green-100 text-green-700 border-green-200',
    iconPath:
      'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016.543.623 1.354 1.016 2.25 1.016.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.25h10.5a.75.75 0 00.75-.75v-5.04c0-.402-.324-.73-.723-.75-2.755-.143-5.631-.143-8.386 0-.399.02-.723.348-.723.75v5.04a.75.75 0 00.75.75z',
  },
  [ORDER_STATUS.DELETED]: {
    label: 'Đã xóa',
    color: 'bg-red-100 text-red-700 border-red-200',
    iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

// --- PAYMENT STATUS (Từ OrderPaymentStatusEnum.cs) ---
export const PAYMENT_STATUS = {
  PENDING: 1,
  PAID: 2,
  REFUNDED: 3,
  FAILED: 4,
}

export const PAYMENT_STATUS_UI = {
  [PAYMENT_STATUS.PENDING]: {
    label: 'Chờ thanh toán',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  [PAYMENT_STATUS.PAID]: {
    label: 'Đã thanh toán',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [PAYMENT_STATUS.REFUNDED]: {
    label: 'Đã hoàn tiền',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [PAYMENT_STATUS.FAILED]: {
    label: 'Thanh toán thất bại',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
}

// --- PAYMENT TYPE (Từ OrderPaymentTypeEnum.cs) ---
export const PAYMENT_TYPE = {
  CHARGE: 1, // charge
  REFUND: 2, // refund
  ADJUSTMENT: 3, // adjustment
}

export const PAYMENT_TYPE_UI = {
  [PAYMENT_TYPE.CHARGE]: {
    label: 'Thanh toán',
    color: 'bg-blue-100 text-blue-700',
  },
  [PAYMENT_TYPE.REFUND]: {
    label: 'Hoàn tiền',
    color: 'bg-orange-100 text-orange-700',
  },
  [PAYMENT_TYPE.ADJUSTMENT]: {
    label: 'Điều chỉnh',
    color: 'bg-gray-100 text-gray-700',
  },
}

// --- ORDER TYPE (Từ OrderTypeEnum.cs) ---
export const ORDER_TYPE = {
  AT_COUNTER: 1, // AtCounter
  DELIVERY: 2, // Delivery
  PICKUP: 3, // Pickup
}

export const ORDER_TYPE_UI = {
  [ORDER_TYPE.AT_COUNTER]: {
    label: 'Tại quầy',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  [ORDER_TYPE.DELIVERY]: {
    label: 'Giao hàng',
    color: 'bg-orange-50 text-orange-700 border-orange-100',
  },
  [ORDER_TYPE.PICKUP]: {
    label: 'Đặt trước',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
}

// --- CANCEL REASONS (Từ OrderCancelReasonEnum.cs) ---
export const CANCEL_REASON = {
  // Khách hàng hủy
  CUSTOMER_CHANGED_MIND: 1,
  CUSTOMER_ORDER_WRONG: 2,

  // Cửa hàng hủy
  STORE_OUT_OF_STOCK: 10,
  STORE_OVERLOADED: 11,
  STORE_CLOSED: 12,

  // Giao hàng/System
  UNREACHABLE_CUSTOMER: 20,
  CUSTOMER_REFUSED: 21,
  AUTO_CANCEL: 50,

  // Other
  OTHER: 99,
}

export const CANCEL_REASON_UI = {
  [CANCEL_REASON.CUSTOMER_CHANGED_MIND]: {
    label: 'Khách đổi ý / Không muốn mua nữa',
    type: 'customer',
  },
  [CANCEL_REASON.CUSTOMER_ORDER_WRONG]: {
    label: 'Khách đặt nhầm món / Nhầm địa chỉ',
    type: 'customer',
  },
  [CANCEL_REASON.STORE_OUT_OF_STOCK]: {
    label: 'Hết món / Hết nguyên liệu',
    type: 'store',
  },
  [CANCEL_REASON.STORE_OVERLOADED]: {
    label: 'Cửa hàng quá tải / Không thể phục vụ',
    type: 'store',
  },
  [CANCEL_REASON.STORE_CLOSED]: {
    label: 'Cửa hàng đóng cửa đột xuất',
    type: 'store',
  },
  [CANCEL_REASON.UNREACHABLE_CUSTOMER]: {
    label: 'Không liên lạc được với khách hàng',
    type: 'delivery',
  },
  [CANCEL_REASON.CUSTOMER_REFUSED]: {
    label: 'Khách hàng bom hàng (Không nhận)',
    type: 'delivery',
  },
  [CANCEL_REASON.AUTO_CANCEL]: {
    label: 'Hệ thống tự động hủy do quá thời gian chờ',
    type: 'system',
  },
  [CANCEL_REASON.OTHER]: {
    label: 'Lý do khác',
    type: 'other',
  },
}

// --- HELPER FUNCTIONS ---

// Lấy danh sách status cho filter
export const getStatusOptions = () => {
  return Object.entries(ORDER_STATUS_UI).map(([key, config]) => ({
    value: Number(key),
    label: config.label,
  }))
}

// Lấy danh sách order type cho filter
export const getOrderTypeOptions = () => {
  return Object.entries(ORDER_TYPE_UI).map(([key, config]) => ({
    value: Number(key),
    label: config.label,
  }))
}

// Lấy danh sách cancel reasons cho dropdown
export const getCancelReasonOptions = () => {
  return Object.entries(CANCEL_REASON_UI).map(([key, config]) => ({
    value: Number(key),
    label: config.label,
    type: config.type,
  }))
}

// Lấy config từ status number
export const getOrderStatusConfig = (statusNumber) => {
  return (
    ORDER_STATUS_UI[statusNumber] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      iconPath: '',
    }
  )
}

// Lấy config từ payment status
export const getPaymentStatusConfig = (paymentStatus) => {
  return (
    PAYMENT_STATUS_UI[paymentStatus] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    }
  )
}

// Lấy config từ order type
export const getOrderTypeConfig = (orderType) => {
  return (
    ORDER_TYPE_UI[orderType] || {
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    }
  )
}

// Kiểm tra xem order có thể hủy không (chỉ những status chưa chuẩn bị)
export const isOrderCancellable = (status) => {
  const nonCancellableStatuses = [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.DELIVERING,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.CANCELLED,
  ]
  return !nonCancellableStatuses.includes(status)
}

// Kiểm tra xem order đã hoàn thành chưa
export const isOrderCompleted = (status) => {
  return status === ORDER_STATUS.COMPLETED || status === ORDER_STATUS.RECEIVED
}

// Kiểm tra xem order đang trong quá trình xử lý
export const isOrderInProgress = (status) => {
  const inProgressStatuses = [
    ORDER_STATUS.NEW,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.DELIVERING,
  ]
  return inProgressStatuses.includes(status)
}

// Thêm vào order.constants.js

// --- PAYMENT SNAPSHOT HELPERS (Từ OrderPaymentSnapshot.cs) ---

/**
 * Tính toán trạng thái thanh toán dựa trên snapshot
 * @param {Object} paymentSnapshot - { paidAmount: number }
 * @param {number} grandTotal - Tổng tiền đơn hàng
 */
export const getPaymentStatusFromSnapshot = (paymentSnapshot, grandTotal) => {
  if (!paymentSnapshot || !paymentSnapshot.paidAmount) {
    return PAYMENT_STATUS.PENDING
  }

  if (paymentSnapshot.paidAmount >= grandTotal) {
    return PAYMENT_STATUS.PAID
  }

  if (paymentSnapshot.paidAmount > 0) {
    return PAYMENT_STATUS.PENDING // Đã thanh toán một phần
  }

  return PAYMENT_STATUS.PENDING
}

/**
 * Kiểm tra đơn hàng đã thanh toán chưa
 */
export const hasAnyPayment = (paymentSnapshot) => {
  return paymentSnapshot && paymentSnapshot.paidAmount > 0
}

/**
 * Kiểm tra đơn hàng đã thanh toán đủ chưa
 */
export const isFullyPaid = (paymentSnapshot, grandTotal) => {
  return paymentSnapshot && paymentSnapshot.paidAmount >= grandTotal
}

/**
 * Format thông tin thanh toán để hiển thị
 */
export const formatPaymentInfo = (paymentSnapshot, grandTotal) => {
  if (!paymentSnapshot || paymentSnapshot.paidAmount === 0) {
    return {
      status: PAYMENT_STATUS.PENDING,
      label: 'Chưa thanh toán',
      paidAmount: 0,
      remaining: grandTotal,
      percent: 0,
    }
  }

  const paidAmount = paymentSnapshot.paidAmount
  const remaining = grandTotal - paidAmount
  const percent = Math.round((paidAmount / grandTotal) * 100)

  if (remaining <= 0) {
    return {
      status: PAYMENT_STATUS.PAID,
      label: 'Đã thanh toán đủ',
      paidAmount,
      remaining: 0,
      percent: 100,
    }
  }

  return {
    status: PAYMENT_STATUS.PENDING,
    label: `Đã thanh toán ${percent}%`,
    paidAmount,
    remaining,
    percent,
  }
}
