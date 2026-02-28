// src/router/client.routes.js
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Lazy load tất cả views để tối ưu performance
const HomeView = () => import('@/views/customer/HomeView.vue')
const ProductsView = () => import('@/views/customer/ProductsView.vue')
const ProductDetailView = () => import('@/views/customer/ProductDetailView.vue')
const AboutUsView = () => import('@/views/customer/AboutUsView.vue')
const StoreDetailView = () => import('@/views/customer/StoreDetailView.vue')
const CartView = () => import('@/views/customer/CartView.vue')
const NewsView = () => import('@/views/customer/NewsView.vue')
const NewsDetailView = () => import('@/views/customer/NewsDetailView.vue')
const CheckoutView = () => import('@/views/customer/CheckoutView.vue')
const OrderDetailView = () => import('@/views/customer/OrderDetailView.vue')
const ProfileView = () => import('@/views/customer/ProfileView.vue')
const RegisterView = () => import('@/views/customer/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/customer/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/customer/ResetPasswordView.vue')
const VerifyEmailView = () => import('@/views/customer/VerifyEmailView.vue')
const FranchiseView = () => import('@/views/customer/FranchiseView.vue')


export const clientRoutes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      // Trang chủ
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'Trang chủ' },
      },

      // Sản phẩm
      {
        path: 'products',
        name: 'products',
        component: ProductsView,
        meta: { title: 'Sản phẩm' },
      },
      {
        path: 'products/:slug',
        name: 'product-detail',
        component: ProductDetailView,
        props: true,
        meta: { title: 'Chi tiết sản phẩm' },
      },

      // Về chúng tôi & Cửa hàng
      {
        path: 'aboutUs',
        name: 'aboutUs',
        component: AboutUsView,
        meta: { title: 'Về chúng tôi' },
      },
      {
        path: 'aboutUs/:slug',
        name: 'store-detail',
        component: StoreDetailView,
        props: true,
        meta: { title: 'Chi tiết cửa hàng' },
      },

      // Tin tức
      {
        path: 'news',
        name: 'news',
        component: NewsView,
        meta: { title: 'Tin tức' },
      },
      {
        path: 'news/:slug',
        name: 'news-detail',
        component: NewsDetailView,
        props: true,
        meta: { title: 'Chi tiết tin tức' },
      },

      // Giỏ hàng & Thanh toán
      {
        path: 'cart',
        name: 'cart',
        component: CartView,
        meta: { title: 'Giỏ hàng' },
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: CheckoutView,
        meta: {
          title: 'Thanh toán',
          requiresAuth: true, // Thêm meta để yêu cầu đăng nhập
        },
      },

      // Đơn hàng
      {
        path: '/orders/:code',
        name: 'order-detail',
        component: OrderDetailView,
        props: true,
        meta: {
          title: 'Chi tiết đơn hàng',
          requiresAuth: true,
        },
      },

      // Người dùng
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          title: 'Hồ sơ',
          requiresAuth: true,
        },
      },

      // Xác thực
      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: { title: 'Đăng ký' },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: { title: 'Quên mật khẩu' },
      },
      {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: { title: 'Đặt lại mật khẩu' },
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: VerifyEmailView,
        meta: { title: 'Xác thực tài khoản' },
      },
      // Khác
      {
        path: 'franchise',
        name: 'franchise',
        component: FranchiseView,
        meta: { title: 'Nhượng quyền' },
      },

    ],
  },
]
