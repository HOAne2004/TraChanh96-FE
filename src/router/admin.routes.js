// src/router/admin.routes.js

export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'), // Layout chứa Sidebar + Header
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      // --- DASHBOARD ---
      {
        path: '', // Mặc định vào /admin sẽ load dashboard
        name: 'admin.dashboard',
        component: () => import('@/views/admin/dashboard/AdminDashboardView.vue'),
        meta: { title: 'Tổng quan' }
      },

      // --- 1. SALES (Bán hàng) ---
      {
        path: 'orders',
        name: 'admin.orders',
        component: () => import('@/views/admin/sales/AdminOrderListView.vue'),
        meta: { title: 'Quản lý Đơn hàng' }
      },
      {
        path: 'orders/:code', // Chi tiết đơn hàng
        name: 'admin.orders.detail',
        component: () => import('@/views/admin/sales/AdminOrderDetailView.vue'),
        meta: { title: 'Chi tiết Đơn hàng' }
      },
      {
        path: 'reservations',
        name: 'admin.reservations',
        component: () => import('@/views/admin/sales/AdminReservationListView.vue'),
        meta: { title: 'Đặt bàn' }
      },
      {
        path: 'franchise-requests',
        name: 'admin.franchise',
        component: () => import('@/views/admin/sales/AdminFranchiseRequestView.vue'),
        meta: { title: 'Yêu cầu Nhượng quyền' }
      },

      // --- 2. CATALOG (Sản phẩm) ---
      {
        path: 'products',
        name: 'admin.products.list',
        component: () => import('@/views/admin/catalog/AdminProductListView.vue'),
        meta: { title: 'Danh sách Sản phẩm' }
      },
      {
        path: 'products/create',
        name: 'admin.products.create',
        component: () => import('@/views/admin/catalog/AdminProductFormView.vue'),
        meta: { title: 'Thêm Sản phẩm' }
      },
      {
        path: 'products/edit/:id',
        name: 'admin.products.edit',
        component: () => import('@/views/admin/catalog/AdminProductFormView.vue'),
        meta: { title: 'Sửa Sản phẩm' }
      },
      {
        path: 'categories',
        name: 'admin.categories',
        component: () => import('@/views/admin/catalog/AdminCategoryManager.vue'),
        meta: { title: 'Danh mục' }
      },
      {
        path: 'attributes', // Size, Toppings...
        name: 'admin.products.attributes',
        component: () => import('@/views/admin/catalog/AdminProductAttributes.vue'),
        meta: { title: 'Thuộc tính Sản phẩm' }
      },

      // --- 3. INVENTORY (Kho) ---
      {
        path: 'inventory',
        name: 'admin.inventory',
        component: () => import('@/views/admin/inventory/AdminInventoryStatusView.vue'),
        meta: { title: 'Tồn kho' }
      },
      {
        path: 'materials',
        name: 'admin.materials',
        component: () => import('@/views/admin/inventory/AdminMaterialManager.vue'),
        meta: { title: 'Nguyên liệu' }
      },
      {
        path: 'supply-orders',
        name: 'admin.supply',
        component: () => import('@/views/admin/inventory/AdminSupplyOrderListView.vue'),
        meta: { title: 'Nhập hàng' }
      },

      // --- 4. USERS (Người dùng) ---
      {
        path: 'users',
        name: 'admin.users.list',
        component: () => import('@/views/admin/users/AdminUserListView.vue'),
        meta: { title: 'Danh sách Người dùng' }
      },
      {
        path: 'users/:id',
        name: 'admin.users.detail',
        component: () => import('@/views/admin/users/AdminUserDetailView.vue'),
        meta: { title: 'Chi tiết Người dùng' }
      },
      {
        path: 'memberships/levels',
        name: 'admin.memberships.levels',
        component: () => import('@/views/admin/users/AdminMembershipConfig.vue'),
        meta: { title: 'Hạng thành viên' }
      },

      // --- 5. HR (Nhân sự) ---
      {
        path: 'staff',
        name: 'admin.staff',
        component: () => import('@/views/admin/hr/AdminStaffListView.vue'),
        meta: { title: 'Nhân viên' }
      },
      {
        path: 'staff/:id',
        name: 'admin.staff.detail',
        component: () => import('@/views/admin/hr/AdminStaffDetailView.vue'),
        meta: { title: 'Hồ sơ Nhân viên' }
      },

      // --- 6. MARKETING ---
      {
        path: 'notifications', // <--- VIEW MỚI BẠN YÊU CẦU
        name: 'admin.notifications',
        component: () => import('@/views/admin/marketing/AdminNotificationManager.vue'),
        meta: { title: 'Gửi Thông báo' }
      },
      {
        path: 'news',
        name: 'admin.news',
        component: () => import('@/views/admin/marketing/AdminNewsListView.vue'),
        meta: { title: 'Tin tức' }
      },
      {
        path: 'vouchers',
        name: 'admin.vouchers',
        component: () => import('@/views/admin/marketing/AdminVoucherListView.vue'),
        meta: { title: 'Mã giảm giá' }
      },
      {
        path: 'banners',
        name: 'admin.banners',
        component: () => import('@/views/admin/marketing/AdminBannerManager.vue'),
        meta: { title: 'Banner' }
      },
      {
        path: 'reviews',
        name: 'admin.reviews',
        component: () => import('@/views/admin/marketing/AdminReviewModeration.vue'),
        meta: { title: 'Đánh giá' }
      },

      // --- 7. SETTINGS (Cấu hình) ---
      {
        path: 'stores',
        name: 'admin.stores',
        component: () => import('@/views/admin/settings/AdminStoreListView.vue'),
        meta: { title: 'Cửa hàng' }
      },
      {
        path: 'settings/general', // Brand, Social Media
        name: 'admin.settings.general',
        component: () => import('@/views/admin/settings/AdminGeneralSettings.vue'),
        meta: { title: 'Cấu hình chung' }
      },
      {
        path: 'settings/map', // Rooms, Tables
        name: 'admin.settings.map',
        component: () => import('@/views/admin/settings/AdminTableMapManager.vue'),
        meta: { title: 'Sơ đồ Bàn/Phòng' }
      },
      {
        path: 'settings/payments',
        name: 'admin.settings.payments',
        component: () => import('@/views/admin/settings/AdminPaymentConfig.vue'),
        meta: { title: 'Thanh toán' }
      },
      {
        path: 'settings/policies',
        name: 'admin.settings.policies',
        component: () => import('@/views/admin/settings/AdminPolicyManager.vue'),
        meta: { title: 'Chính sách' }
      },
    ]
  }
]
