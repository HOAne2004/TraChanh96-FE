export const PAYMENT_TYPE = {
  COD: 'cod',
  BANK_TRANSFER: 'bankingTransfer',
  EWALLET: 'ewallet',
  CARD: 'card',
  VnPAY: 'vnpay',
}

export const PAYMENT_TYPE_UI = {
  [PAYMENT_TYPE.COD]: { label: 'Tiền mặt (COD)', icon: '📦' },
  [PAYMENT_TYPE.BANK_TRANSFER]: { label: 'Chuyển khoản', icon: '🏦' },
  [PAYMENT_TYPE.EWALLET]: { label: 'Ví điện tử', icon: '📲' },
  [PAYMENT_TYPE.CARD]: { label: 'Thẻ', icon: '💳' },
  [PAYMENT_TYPE.VnPAY]: { label: 'VNPAY', icon: '💳' },
}
