import { createRouter, createWebHistory } from 'vue-router'
//import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/user'
import { USER_ROLE } from '@/constants/user.constants'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

// User
import { clientRoutes } from './client.routes'
//admin
import { adminRoutes } from './admin.routes'
//staff
import { staffRoutes } from './staff.routes'
const routes = [
  ...clientRoutes,
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
  const userRole = auth.user?.role

  // --- A. Kiểm tra Đăng nhập ---
  if (to.meta.requiresAuth && !isLoggedIn) {
    // Nếu chưa đăng nhập mà đòi vào trang cần Auth -> Về trang chủ
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

  if (to.meta.title) {
    document.title = `${to.meta.title} | Trà Chanh 96`
  } else {
    document.title = 'Trà Chanh 96'
  }

  next()
})

export default router
