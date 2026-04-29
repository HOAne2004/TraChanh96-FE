import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDark = ref(false)

  const toggleDark = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const initTheme = () => {
    if (localStorage.getItem('theme') === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  }

  return { isDark, toggleDark, initTheme }
})
