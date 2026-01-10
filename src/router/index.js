import { createRouter, createWebHistory } from 'vue-router'
//import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/user'
import { USER_ROLE } from '@/constants/user.constants'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

// User
import HomeView from '@/views/customer/HomeView.vue'
const ProductsView = () => import('@/views/customer/ProductsView.vue') //lazy load
const AboutUsView = () => import('@/views/customer/AboutUsView.vue')
const NewsView = () => import('@/views/customer/NewsView.vue')
const CartView = () => import('@/views/customer/CartView.vue')
const RegisterView = () => import('@/views/customer/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/customer/ForgotPasswordView.vue')
const CheckoutView = () => import('@/views/customer/CheckoutView.vue')
const ProfileView = () => import('@/views/customer/ProfileView.vue')
const FranchiseView = () => import('@/views/customer/FranchiseView.vue')
const NotificationView = () => import('@/views/customer/NotificationView.vue')
//admin
import { adminRoutes } from './admin.routes'
//staff
import {staffRoutes} from './staff.routes';
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: HomeView },

      { path: 'products', name: 'products', component: ProductsView },
      {
        path: 'products/:slug',
        name: 'product-detail',
        component: () => import('@/views/customer/ProductDetailView.vue'),
        props: true,
      },

      { path: 'aboutUs', name: 'aboutUs', component: AboutUsView },
      {
        path: 'aboutUs/:slug',
        name: 'store-detail',
        component: () => import('@/views/customer/StoreDetailView.vue'),
        props: true,
      },

      { path: 'cart', name: 'cart', component: CartView },
      { path: 'news', name: 'news', component: NewsView },
      {
        path: 'news/:slug',
        name: 'news-detail',
        component: () => import('@/views/customer/NewsDetailView.vue'),
        props: true,
      },

      { path: 'checkout', name: 'checkout', component: CheckoutView },

      {
        path: '/orders/:code',
        name: 'order-detail',
        component: () => import('@/views/customer/OrderDetailView.vue'),
        props: true,
      },

      { path: 'profile', name: 'profile', component: ProfileView },

      // 🚨 ROUTES XÁC THỰC MỚI
      { path: 'register', name: 'register', component: RegisterView }, // Đăng ký
      { path: 'forgot-password', name: 'forgot-password', component: ForgotPasswordView }, // Quên mật khẩu

      { path: 'franchise', name: 'franchise', component: FranchiseView }, // Franchise
      { path: 'notifications', name: 'notification', component: NotificationView }, // Notification
    ],
  },
  ...adminRoutes,
  ...staffRoutes,
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/views/customer/NotFoundView.vue'),
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes, //KHÔNG ĐƯỢC BỎ DÒNG NÀY
  scrollBehavior(to, from, savedPosition) {
    // Luôn scroll về đầu trang khi chuyển route
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const auth = useUserStore()
  const isLoggedIn = auth.isLoggedIn
  const userRole = auth.user?.role // Đây là số (Enum), ví dụ: 2

  // --- A. Kiểm tra Đăng nhập ---
  if (to.meta.requiresAuth && !isLoggedIn) {
    // Nếu chưa đăng nhập mà đòi vào trang cần Auth -> Về trang chủ (hoặc trang login tùy bạn)
    return next('/')
  }

  // --- B. Kiểm tra Quyền (Role) ---
  if (to.meta.role) {
    // Nếu chưa đăng nhập thì chặn luôn (để chắc chắn có userRole)
    if (!isLoggedIn || !userRole) {
      return next('/')
    }

    // Chuẩn hóa requiredRoles thành Mảng (để hỗ trợ 1 route cho phép nhiều role)
    // Ví dụ: meta: { role: USER_ROLE.ADMIN } hoặc meta: { role: [USER_ROLE.ADMIN, USER_ROLE.STAFF] }
    const requiredRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]

    // Kiểm tra xem Role của user có nằm trong danh sách cho phép không
    if (!requiredRoles.includes(userRole)) {
      console.warn(
        `⛔ Access Denied: User role ${userRole} is not in allowed list [${requiredRoles}]`,
      )
      return next('/') // Hoặc trang 403 Forbidden
    }
  }

  next()
})

export default router
