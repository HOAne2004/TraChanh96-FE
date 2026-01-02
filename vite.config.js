import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@images': fileURLToPath(new URL('./public/images', import.meta.url)),
      '@logo': fileURLToPath(new URL('./src/assets/logo', import.meta.url)),
      '@customer': fileURLToPath(new URL('./src/components/customer', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/components/admin', import.meta.url)),
      '@common': fileURLToPath(new URL('./src/components/common', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@auth': fileURLToPath(new URL('./src/components/auth', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://trachanh96-be-production.up.railway.app', // Link BE gốc
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Giữ nguyên prefix /api
      },
    },
  },
})
