// src/constants/productOptions.js

export const SUGAR_OPTIONS = [
    { id: 0, label: 'Không đường' },
    { id: 30, label: '30% Đường' },
    { id: 50, label: '50% Đường' },
    { id: 70, label: '70% Đường' },
    { id: 100, label: '100% Đường' }
];


export const ICE_OPTIONS = [
    { id: 0, label: 'Không đá' },
    { id: 1, label: 'Ấm' },
    { id: 2, label: 'Nóng' },
    { id: 30, label: '30% Đá' },
    { id: 50, label: '50% Đá' },
    { id: 70, label: '70% Đá' },
    { id: 100, label: '100% Đá' }
];

export const ProductStatus = Object.freeze({
    DRAFT: 1,
    ACTIVE: 2,
    INACTIVE: 3,
    OUT_OF_STOCK: 4,
    DELETED: 99
})

export const SugarLevel = Object.freeze({
    NONE: 0,
    PERCENT_30: 30,
    PERCENT_50: 50,
    PERCENT_70: 70,
    PERCENT_100: 100
})

export const IceLevel = Object.freeze({
    NONE: 0,
    WARM: 1,
    HOT: 2,
    PERCENT_30: 30,
    PERCENT_50: 50,
    PERCENT_70: 70,
    PERCENT_100: 100
})
export const PublicStatus = Object.freeze({
    PENDING: 1,
    ACTIVE: 2,
    INACTIVE: 3,
    DELETED: 99
})

export const OrderStatus = Object.freeze({
    NEW: 1,
    CONFIRMED: 2,
    PREPARING: 3,
    READY: 4,
    DELIVERING: 5,
    COMPLETED: 6,
    CANCELLED: 7
})

export const PaymentStatus = Object.freeze({
    PENDING: 1,
    PAID: 2,
    REFUNDED: 3,
    FAILED: 4
})

export const PaymentType = Object.freeze({
    COD: 1,
    BANK_TRANSFER: 2,
    E_WALLET: 3,
    CARD: 4
})

export const StoreStatus = Object.freeze({
    COMING_SOON: 1,
    ACTIVE: 2,
    TEMPORARILY_CLOSED: 3,
    PERMANENTLY_CLOSED: 4,
    DELETED: 99
})
