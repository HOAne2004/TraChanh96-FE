// src/router/admin.routes.js
import { USER_ROLE } from '@/constants/user.constants' // 🟢 Import
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'), // Layout chứa Sidebar + Header
    meta: { requiresAuth: true, role: USER_ROLE.ADMIN },
    children: [
      // --- DASHBOARD ---
      {
        path: '', // Mặc định vào /admin sẽ load dashboard
        name: 'admin.dashboard',
        component: () => import('@/views/admin/dashboard/AdminDashboardView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Tổng quan' },
      },

      // --- 1. SALES (Bán hàng) ---
      {
        path: 'orders',
        name: 'admin.orders',
        component: () => import('@/views/admin/sales/AdminOrderListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Quản lý Đơn hàng' },
      },
      {
        path: 'orders/:code', // Chi tiết đơn hàng
        name: 'admin.orders.detail',
        component: () => import('@/views/admin/sales/AdminOrderDetailView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Chi tiết Đơn hàng' },
      },
      {
        path: 'reservations',
        name: 'admin.reservations',
        component: () => import('@/views/admin/sales/AdminReservationListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Đặt bàn' },
      },
      {
        path: 'franchise-requests',
        name: 'admin.franchise',
        component: () => import('@/views/admin/sales/AdminFranchiseRequestView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Yêu cầu Nhượng quyền' },
      },

      // --- 2. CATALOG (Sản phẩm) ---
      {
        path: 'products',
        name: 'admin.products.list',
        component: () => import('@/views/admin/catalog/product/AdminProductListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Danh sách Sản phẩm' },
      },
      {
        path: 'products/create',
        name: 'admin.products.create',
        component: () => import('@/views/admin/catalog/product/AdminProductFormView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Thêm Sản phẩm' },
      },
      {
        path: 'products/edit/:id',
        name: 'admin.products.edit',
        component: () => import('@/views/admin/catalog/product/AdminProductFormView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Sửa Sản phẩm' },
      },
      {
        path: 'categories',
        name: 'admin.categories',
        component: () => import('@/views/admin/catalog/AdminCategoryManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Danh mục' },
      },
      {
        path: 'attributes', // Size, Toppings...
        name: 'admin.products.attributes',
        component: () => import('@/views/admin/catalog/product/AdminProductAttributes.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Thuộc tính Sản phẩm' },
      },

      // --- 3. INVENTORY (Kho) ---
      {
        path: 'inventory',
        name: 'admin.inventory',
        component: () => import('@/views/admin/inventory/AdminInventoryStatusView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Tồn kho' },
      },
      {
        path: 'materials',
        name: 'admin.materials',
        component: () => import('@/views/admin/inventory/AdminMaterialManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Nguyên liệu' },
      },
      {
        path: 'supply-orders',
        name: 'admin.supply',
        component: () => import('@/views/admin/inventory/AdminSupplyOrderListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Nhập hàng' },
      },

      // --- 4. USERS (Người dùng) ---
      {
        path: 'users',
        name: 'admin.users.list',
        component: () => import('@/views/admin/users/AdminUserListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Danh sách Người dùng' },
      },
      {
        path: 'users/:id',
        name: 'admin.users.detail',
        component: () => import('@/views/admin/users/AdminUserDetailView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Chi tiết Người dùng' },
      },
      {
        path: 'memberships/levels',
        name: 'admin.memberships.levels',
        component: () => import('@/views/admin/users/AdminMembershipConfig.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Hạng thành viên' },
      },

      // --- 5. HR (Nhân sự) ---
      {
        path: 'staff',
        name: 'admin.staff',
        component: () => import('@/views/admin/hr/AdminStaffListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Nhân viên' },
      },
      {
        path: 'staff/:id',
        name: 'admin.staff.detail',
        component: () => import('@/views/admin/hr/AdminStaffDetailView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Hồ sơ Nhân viên' },
      },

      // --- 6. MARKETING ---
      {
        path: 'notifications', // <--- VIEW MỚI BẠN YÊU CẦU
        name: 'admin.notifications',
        component: () => import('@/views/admin/marketing/AdminNotificationManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Gửi Thông báo' },
      },
      {
        path: 'news',
        name: 'admin.news',
        component: () => import('@/views/admin/marketing/AdminNewsListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Tin tức' },
      },
      {
        path: 'vouchers',
        name: 'admin.vouchers',
        component: () => import('@/views/admin/marketing/AdminVoucherListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Mã giảm giá' },
      },
      {
        path: 'banners',
        name: 'admin.banners',
        component: () => import('@/views/admin/marketing/AdminBannerManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Banner' },
      },
      {
        path: 'reviews',
        name: 'admin.reviews',
        component: () => import('@/views/admin/marketing/AdminReviewModeration.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Đánh giá' },
      },

      // --- 7. SETTINGS (Cấu hình) ---
      {
        path: 'stores',
        name: 'admin.stores',
        component: () => import('@/views/admin/settings/store/AdminStoreListView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Cửa hàng' },
      },
      {
        path: '/admin/stores/create',
        name: 'admin-store-create',
        component: () => import('@/views/admin/settings/store/AdminStoreFormView.vue'),
        meta: { title: 'Thêm cửa hàng mới' },
      },
      {
        path: '/admin/stores/edit/:id',
        name: 'admin-store-edit',
        component: () => import('@/views/admin/settings/store/AdminStoreFormView.vue'),
        meta: { title: 'Cập nhật cửa hàng' },
      },

      {
        path: 'settings/general', // Brand, Social Media
        name: 'admin.settings.general',
        component: () => import('@/views/admin/settings/AdminGeneralSettings.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Cấu hình chung' },
      },
      {
        path: 'settings/map', // Rooms, Tables
        name: 'admin.settings.map',
        component: () => import('@/views/admin/settings/AdminTableMapManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Sơ đồ Bàn/Phòng' },
      },
      {
        path: 'settings/payments',
        name: 'admin.settings.payments',
        component: () => import('@/views/admin/settings/AdminPaymentConfig.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Thanh toán' },
      },
      {
        path: 'settings/policies',
        name: 'admin.settings.policies',
        component: () => import('@/views/admin/settings/AdminPolicyManager.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Chính sách' },
      },
      {
        path: 'trash', // /admin/trash
        name: 'admin.trash',
        component: () => import('@/views/admin/settings/AdminTrashCenterView.vue'),
        meta: { role: USER_ROLE.ADMIN, title: 'Thùng rác hệ thống' },
      },
    ],
  },
]
