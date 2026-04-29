import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/identity/user.store'
import { imageFallbackDirective } from '@/utils/imageFallback'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.config.devtools = false

const userStore = useUserStore()
if (userStore.token) {
  userStore.fetchUserProfile()
}

app.directive('img-fallback', imageFallbackDirective)

app.mount('#app')
