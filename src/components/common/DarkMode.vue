<script setup>
import { useUIStore } from '@/stores/uiStore'
import Button from '@/components/common/Button.vue'
import { ref, onMounted } from 'vue'

const ui = useUIStore()
const isAnimating = ref(false)

// Tạo overlay toàn màn hình
const overlay = ref(null)

const handleToggle = () => {
  if (isAnimating.value) return

  isAnimating.value = true

  // Lấy vị trí của button để bắt đầu animation
  const button = event?.currentTarget || document.querySelector('.dark-mode-toggle')
  const rect = button.getBoundingClientRect()

  // Thiết lập vị trí bắt đầu cho animation
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Tạo overlay nếu chưa có
  if (!overlay.value) {
    createOverlay()
  }

  // Hiển thị overlay và thiết lập vị trí xuất phát
  overlay.value.style.left = `${centerX}px`
  overlay.value.style.top = `${centerY}px`
  overlay.value.style.display = 'block'

  // Force reflow để animation chạy
  void overlay.value.offsetWidth

  // Bắt đầu animation dựa trên chế độ hiện tại
  if (ui.isDark) {
    // Đang dark -> light
    overlay.value.classList.add('to-light')
    overlay.value.classList.remove('to-dark')
  } else {
    // Đang light -> dark
    overlay.value.classList.add('to-dark')
    overlay.value.classList.remove('to-light')
  }

  // Thay đổi theme sau 300ms để animation đồng bộ
  setTimeout(() => {
    ui.toggleDark()

    // Ẩn overlay sau khi animation hoàn tất
    setTimeout(() => {
      overlay.value.style.display = 'none'
      isAnimating.value = false
    }, 800)
  }, 300)
}

const createOverlay = () => {
  const overlayEl = document.createElement('div')
  overlayEl.className = 'darkmode-overlay'
  overlayEl.innerHTML = `
    <div class="sun-animation">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    </div>
    <div class="moon-animation">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    </div>
  `

  document.body.appendChild(overlayEl)
  overlay.value = overlayEl
}

onMounted(() => {
  createOverlay()
})
</script>

<template>
  <Button
    variant="secondary"
    size="md"
    :aria-label="ui.isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
    @click="handleToggle"
    class="dark-mode-toggle"
    :disabled="isAnimating"
  >
    <div class="toggle-icon">
      <div class="icon-wrapper" v-if="!ui.isDark">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      </div>
      <div class="icon-wrapper" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </div>
    </div>
  </Button>
</template>

<style scoped>
.dark-mode-toggle {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: visible;
  transition: transform 0.3s ease;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-wrapper svg {
  width: 24px;
  height: 24px;
  transition: transform 0.5s ease;
  color: var(--color-text);
}

.dark-mode-toggle:hover .icon-wrapper svg {
  transform: rotate(30deg);
}
</style>

<style>
/* Overlay toàn màn hình */
.darkmode-overlay {
  position: fixed;
  width: 0;
  height: 0;
  border-radius: 50%;
  z-index: 9999;
  pointer-events: none;
  transform: translate(-50%, -50%);
  display: none;
  overflow: hidden;
}

/* Animation cho chế độ sáng -> tối */
.darkmode-overlay.to-dark {
  animation: expandDark 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Animation cho chế độ tối -> sáng */
.darkmode-overlay.to-light {
  animation: expandLight 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Icon mặt trời */
.sun-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  opacity: 0;
  z-index: 2;
}

.to-dark .sun-animation {
  animation: sunExit 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.to-light .sun-animation {
  animation: sunEnter 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.sun-animation svg {
  width: 100%;
  height: 100%;
  color: #FFD700;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

/* Icon mặt trăng */
.moon-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  opacity: 0;
  z-index: 2;
}

.to-dark .moon-animation {
  animation: moonEnter 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.to-light .moon-animation {
  animation: moonExit 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.moon-animation svg {
  width: 100%;
  height: 100%;
  color: #E6E6FA;
  filter: drop-shadow(0 0 10px rgba(230, 230, 250, 0.5));
}

/* Keyframes */
@keyframes expandDark {
  0% {
    width: 0;
    height: 0;
    background: rgba(255, 215, 0, 0.1);
    box-shadow:
      0 0 0 0 rgba(255, 215, 0, 0.2),
      0 0 0 0 rgba(255, 215, 0, 0.1);
  }
  30% {
    background: rgba(255, 215, 0, 0.3);
    box-shadow:
      0 0 100px 50px rgba(255, 215, 0, 0.3),
      0 0 200px 100px rgba(255, 215, 0, 0.1);
  }
  70% {
    background: rgba(30, 30, 60, 0.8);
    box-shadow:
      0 0 200px 150px rgba(30, 30, 60, 0.6),
      0 0 400px 250px rgba(30, 30, 60, 0.3);
  }
  100% {
    width: 300vw;
    height: 300vw;
    background: rgba(18, 18, 18, 0.9);
    box-shadow:
      0 0 300px 200px rgba(18, 18, 18, 0.8),
      0 0 600px 400px rgba(18, 18, 18, 0.4);
    opacity: 0;
  }
}

@keyframes expandLight {
  0% {
    width: 0;
    height: 0;
    background: rgba(230, 230, 250, 0.1);
    box-shadow:
      0 0 0 0 rgba(230, 230, 250, 0.2),
      0 0 0 0 rgba(230, 230, 250, 0.1);
  }
  30% {
    background: rgba(230, 230, 250, 0.3);
    box-shadow:
      0 0 100px 50px rgba(230, 230, 250, 0.3),
      0 0 200px 100px rgba(230, 230, 250, 0.1);
  }
  70% {
    background: rgba(255, 255, 255, 0.8);
    box-shadow:
      0 0 200px 150px rgba(255, 255, 255, 0.6),
      0 0 400px 250px rgba(255, 255, 255, 0.3);
  }
  100% {
    width: 300vw;
    height: 300vw;
    background: rgba(255, 255, 255, 0.9);
    box-shadow:
      0 0 300px 200px rgba(255, 255, 255, 0.8),
      0 0 600px 400px rgba(255, 255, 255, 0.4);
    opacity: 0;
  }
}

@keyframes sunExit {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  }
  70% {
    opacity: 0.5;
    transform: translate(calc(-50% + 100px), -50%) scale(0.8) rotate(360deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + 150px), -50%) scale(0) rotate(450deg);
  }
}

@keyframes sunEnter {
  0% {
    opacity: 0;
    transform: translate(calc(-50% - 150px), -50%) scale(0) rotate(-450deg);
  }
  30% {
    opacity: 0.5;
    transform: translate(calc(-50% - 100px), -50%) scale(0.8) rotate(-360deg);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotate(-180deg);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes moonEnter {
  0% {
    opacity: 0;
    transform: translate(calc(-50% - 150px), -50%) scale(0) rotate(-450deg);
  }
  30% {
    opacity: 0.5;
    transform: translate(calc(-50% - 100px), -50%) scale(0.8) rotate(-360deg);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotate(-180deg);
    filter: drop-shadow(0 0 20px rgba(230, 230, 250, 0.8));
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes moonExit {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
    filter: drop-shadow(0 0 20px rgba(230, 230, 250, 0.8));
  }
  70% {
    opacity: 0.5;
    transform: translate(calc(-50% + 100px), -50%) scale(0.8) rotate(360deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + 150px), -50%) scale(0) rotate(450deg);
  }
}

/* Đảm bảo body có position relative để overlay hoạt động */
body {
  position: relative;
  overflow-x: hidden;
}

/* Hiệu ứng mờ cho nền trong khi animation */
.darkmode-overlay.active {
  pointer-events: all;
}

/* Tối ưu hiệu suất */
@media (prefers-reduced-motion: reduce) {
  .darkmode-overlay,
  .sun-animation,
  .moon-animation {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
