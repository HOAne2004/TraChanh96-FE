// src/utils/formatters.js

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  if (!dateString.endsWith('Z')) {
    dateString += 'Z'
  }
  const date = new Date(dateString)

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  return date.toLocaleString('vi-VN', options)
}

export const formatPrice = (value) => {
  if (value === null || value === undefined) return ''

  const number = Number(value)
  if (isNaN(number)) return ''

  return number.toLocaleString('vi-VN') // 1.000.000
}
export const formatCurrencyCompact = (value) => {
  if (value === null || value === undefined) return '0'
  const number = Number(value)
  if (isNaN(number)) return '0'

  // 1. Tỷ (>= 1.000.000.000)
  if (number >= 1_000_000_000) {
    // toFixed(1): lấy 1 số thập phân (VD: 1.5)
    // replace: nếu là 1.0 thì bỏ .0 đi thành 1
    return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' Tỷ'
  }

  // 2. Triệu (>= 1.000.000)
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' Tr'
  }

  // 3. Nghìn (>= 1.000) - Tùy chọn, nếu muốn hiện 500k thay vì 500.000
  if (number >= 1_000) {
     return (number / 1_000).toFixed(1).replace(/\.0$/, '') + ' k'
  }

  // Nhỏ hơn 1 nghìn thì hiển thị bình thường
  return number.toLocaleString('vi-VN')
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
