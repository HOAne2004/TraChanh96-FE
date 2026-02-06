// src/configs/trash.config.js
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
// Sau này import thêm: import { useUserStore } from '@/stores/user'

export const TRASH_MODULES = {
  // 1. Cấu hình cho Sản phẩm
  products: {
    label: 'Sản phẩm',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', // SVG path
    
    // Hàm lấy Store tương ứng
    useStore: useProductStore, 
    
    // Cấu hình cột hiển thị
    columns: [
      { key: 'id', label: 'ID', width: '80px' },
      { key: 'imageUrl', label: 'Hình ảnh', type: 'image' }, // Đánh dấu type để View xử lý
      { key: 'name', label: 'Tên sản phẩm' },
      { key: 'deletedAt', label: 'Ngày xóa', type: 'date', cellClass: 'text-red-500' },
      { key: 'basePrice', label: 'Giá gốc', type: 'price' },
    ],

    // Action API (Tên hàm trong Store phải chuẩn hóa)
    // Giả sử các store đều có hàm: fetchDeleted({ pageSize }) và restore(id)
    fetchAction: 'fetchProducts', 
    fetchParams: { status: 99, pageSize: 100 }, // Tham số riêng của module này
    restoreAction: 'restoreProduct'
  },

  // 2. Cấu hình cho Đơn hàng
  orders: {
    label: 'Đơn hàng',
    icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
    useStore: useOrderStore,
    columns: [
      { key: 'orderCode', label: 'Mã đơn' },
      { key: 'recipientName', label: 'Khách hàng' },
      { key: 'deletedAt', label: 'Ngày xóa', type: 'date', cellClass: 'text-red-500' },
      { key: 'grandTotal', label: 'Tổng tiền', type: 'price' },
      { key: 'status', label: 'Trạng thái', type: 'status' } // Type status cần xử lý riêng
    ],
    fetchAction: 'fetchOrders',
    fetchParams: { isDeleted: true, pageSize: 100 },
    restoreAction: 'restoreOrderAction'
  },

  // 3. Sau này thêm User thì chỉ cần viết thêm vào đây, không sửa View
  /*
  users: {
    label: 'Người dùng',
    useStore: useUserStore,
    columns: [ ... ],
    ...
  }
  */
}