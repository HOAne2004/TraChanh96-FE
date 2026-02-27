// src/router/admin.routes.js
import { USER_ROLE } from '@/constants/user.constants'

export const adminRoutes = [
  {
    path: '/admin',
    // Lazy load Layout Admin: Rất tốt, giúp user thường không phải tải layout này
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      role: USER_ROLE.ADMIN
    },
    children: [
      // --- DASHBOARD ---
      {
        path: '', // path rỗng = /admin
        name: 'admin.dashboard',
        component: () => import('@/views/admin/dashboard/AdminDashboardView.vue'),
        meta: { title: 'Tổng quan' },
      },

      // --- 1. SALES (Bán hàng) ---
      {
        path: 'orders', // Tự động nối thành /admin/orders
        name: 'admin.orders',
        component: () => import('@/views/admin/sales/AdminOrderListView.vue'),
        meta: { title: 'Quản lý Đơn hàng' },
      },
      {
        path: 'orders/:code',
        name: 'admin.orders.detail',
        component: () => import('@/views/admin/sales/AdminOrderDetailView.vue'),
        meta: { title: 'Chi tiết Đơn hàng' },
      },
      {
        path: 'reservations',
        name: 'admin.reservations',
        component: () => import('@/views/admin/sales/AdminReservationListView.vue'),
        meta: { title: 'Đặt bàn' },
      },
      {
        path: 'franchise-requests',
        name: 'admin.franchise',
        component: () => import('@/views/admin/sales/AdminFranchiseRequestView.vue'),
        meta: { title: 'Yêu cầu Nhượng quyền' },
      },

      // --- 2. CATALOG (Sản phẩm) ---
      {
        path: 'products',
        name: 'admin.products',
        component: () => import('@/views/admin/catalog/product/AdminProductListView.vue'),
        meta: { title: 'Danh sách Sản phẩm' },
      },
      {
        path: 'products/create',
        name: 'admin.products.create',
        component: () => import('@/views/admin/catalog/product/AdminProductFormView.vue'),
        meta: { title: 'Thêm Sản phẩm' },
      },
      {
        path: 'products/edit/:id',
        name: 'admin.products.edit',
        component: () => import('@/views/admin/catalog/product/AdminProductFormView.vue'),
        meta: { title: 'Sửa Sản phẩm' },
      },
      {
        path: 'categories',
        name: 'admin.categories',
        component: () => import('@/views/admin/catalog/AdminCategoryManager.vue'),
        meta: { title: 'Danh mục' },
      },
      {
        path: 'attributes',
        name: 'admin.products.attributes',
        component: () => import('@/views/admin/catalog/product/AdminProductAttributes.vue'),
        meta: { title: 'Thuộc tính Sản phẩm' },
      },

      // --- 3. INVENTORY (Kho) ---
      {
        path: 'inventory',
        name: 'admin.inventory',
        component: () => import('@/views/admin/inventory/AdminInventoryStatusView.vue'),
        meta: { title: 'Tồn kho' },
      },
      {
        path: 'materials',
        name: 'admin.materials',
        component: () => import('@/views/admin/inventory/AdminMaterialManager.vue'),
        meta: { title: 'Nguyên liệu' },
      },
      {
        path: 'supply-orders',
        name: 'admin.supply',
        component: () => import('@/views/admin/inventory/AdminSupplyOrderListView.vue'),
        meta: { title: 'Nhập hàng' },
      },

      // --- 4. CUSTOMER (Khách hàng) ---
      {
        path: 'customer',
        name: 'admin.customer.list',
        component: () => import('@/views/admin/customer/AdminCustomerListView.vue'),
        meta: { title: 'Danh sách Khách hàng' },
      },
      {
        path: 'customer/create',
        name: 'admin.customer.create',
        component: () => import('@/views/admin/customer/AdminCustomerCreateView.vue'),
        meta: { title: 'Thêm Khách hàng' },
      },
      {
        path: 'customer/:id',
        name: 'admin.customer.detail',
        component: () => import('@/views/admin/customer/AdminCustomerDetailView.vue'),
        meta: { title: 'Chi tiết Khách hàng' },
      },
      {
        path: 'memberships/levels',
        name: 'admin.memberships.levels',
        component: () => import('@/views/admin/customer/AdminMembershipConfig.vue'),
        meta: { title: 'Hạng thành viên' },
      },

      // --- 5. HR (Nhân sự) ---
      {
        path: 'staff',
        name: 'admin.staff',
        component: () => import('@/views/admin/hr/AdminStaffListView.vue'),
        meta: { title: 'Nhân viên' },
      },
      {
        path: 'staff/:id',
        name: 'admin.staff.detail',
        component: () => import('@/views/admin/hr/AdminStaffDetailView.vue'),
        meta: { title: 'Hồ sơ Nhân viên' },
      },
      {
        path: 'manager',
        name: 'admin.manager',
        component: () => import('@/views/admin/hr/AdminManagerListView.vue'),
        meta: { title: 'Quản lý' },
      },
      {
        path: 'manager/:id',
        name: 'admin.manager.detail',
        component: () => import('@/views/admin/hr/AdminManagerDetailView.vue'),
        meta: { title: 'Hồ sơ Quản lý' },
      },

      // --- 6. MARKETING ---
      {
        path: 'notifications',
        name: 'admin.notifications',
        component: () => import('@/views/admin/marketing/AdminNotificationManager.vue'),
        meta: { title: 'Gửi Thông báo' },
      },
      {
        path: 'news',
        name: 'admin.news',
        component: () => import('@/views/admin/marketing/AdminNewsListView.vue'),
        meta: { title: 'Tin tức' },
      },
      {
        path: 'vouchers',
        name: 'admin.vouchers',
        component: () => import('@/views/admin/marketing/AdminVoucherListView.vue'),
        meta: { title: 'Mã giảm giá' },
      },
      {
        path: 'banners',
        name: 'admin.banners',
        component: () => import('@/views/admin/marketing/AdminBannerManager.vue'),
        meta: { title: 'Banner' },
      },
      {
        path: 'reviews',
        name: 'admin.reviews',
        component: () => import('@/views/admin/marketing/AdminReviewModeration.vue'),
        meta: { title: 'Đánh giá' },
      },

      // --- 7. SETTINGS (Cấu hình) ---
      {
        path: 'stores',
        name: 'admin.stores',
        component: () => import('@/views/admin/settings/store/AdminStoreListView.vue'),
        meta: { title: 'Cửa hàng' },
      },
      {
        path: 'stores/create',
        name: 'admin-store-create',
        component: () => import('@/views/admin/settings/store/AdminStoreFormView.vue'),
        meta: { title: 'Thêm cửa hàng mới' },
      },
      {
        path: 'stores/edit/:id',
        name: 'admin-store-edit',
        component: () => import('@/views/admin/settings/store/AdminStoreFormView.vue'),
        meta: { title: 'Cập nhật cửa hàng' },
      },
      {
        path: 'stores/:id/menu',
        name: 'admin.store.menu',
        component: () => import('@/views/admin/settings/store/AdminStoreMenu.vue'),
        meta: { title: 'Quản lý thực đơn' },
      },
      {
        path: 'settings/general',
        name: 'admin.settings.general',
        component: () => import('@/views/admin/settings/AdminGeneralSettings.vue'),
        meta: { title: 'Cấu hình chung' },
      },
      {
        path: 'settings/map',
        name: 'admin.settings.map',
        component: () => import('@/views/admin/settings/AdminTableMapManager.vue'),
        meta: { title: 'Sơ đồ Bàn/Phòng' },
      },
      {
        path: 'settings/payments',
        name: 'admin.settings.payments',
        component: () => import('@/views/admin/settings/AdminPaymentConfig.vue'),
        meta: { title: 'Thanh toán' },
      },
      {
        path: 'settings/policies',
        name: 'admin.settings.policies',
        component: () => import('@/views/admin/settings/AdminPolicyManager.vue'),
        meta: { title: 'Chính sách' },
      },
      {
        path: 'trash',
        name: 'admin.trash',
        component: () => import('@/views/admin/settings/AdminTrashCenterView.vue'),
        meta: { title: 'Thùng rác hệ thống' },
      },
    ],
  },
]
