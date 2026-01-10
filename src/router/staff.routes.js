// src/router/staff.routes.js
import { USER_ROLE } from '@/constants/user.constants'

// Import Layout
// Lưu ý: Đảm bảo bạn đã tạo file StaffLayout.vue (hoặc dùng tạm AdminLayout nếu chưa có)
const StaffLayout = () => import('@/layouts/StaffLayout.vue');

// Views
const PosCounterView = () => import('@/views/staff/pos/PosCounterView.vue');

const StaffOrderBoard = () => import('@/views/staff/orders/StaffOrderBoard.vue');

const TableManagerView = () => import('@/views/staff/tables/TableManagerView.vue');
const StaffOrderHistoryView = () => import('@/views/staff/orders/StaffOrderHistoryView.vue');
const ShiftReportView = () => import('@/views/staff/shift/ShiftReportView.vue');

export const staffRoutes = [
    {
        path: '/staff',
        component: StaffLayout,
        meta: {
            requiresAuth: true,
            role: [USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.STAFF]
        },
        children: [
            {
                path: '',                // Mặc định vào màn hình Bếp (hoặc POS tùy bạn)
                redirect: { name: 'staff.pos' }
            },
            {
                path: 'pos',
                name: 'staff.pos',
                component: PosCounterView,
                meta: { title: 'Bán hàng tại quầy' }
            },
            {
                path: 'tables',
                name: 'staff.tables',
                component: TableManagerView,
                meta: { title: 'Quản lý bàn & Đặt chỗ' }
            },
            {
                path: 'orders',
                name: 'staff.orders',
                component: StaffOrderBoard,
                meta: { title: 'Màn hình Bếp/Bar' }
            },
            {
                path: 'orders/history',
                name: 'staff.orders.history',
                component: StaffOrderHistoryView,
                meta: { title: 'Lịch sử đơn hàng' }
            },
            {
                path: 'shift',
                name: 'staff.shift',
                component: ShiftReportView,
                meta: { title: 'Quản lý ca làm việc' }
            }
        ]
    }
];
