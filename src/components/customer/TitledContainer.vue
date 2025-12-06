<script setup>
import NavLink from '@common/NavLink.vue'

import { ref, onMounted, onUnmounted, nextTick, onUpdated } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  controls: {
    type: String,
    default: '',
  },
  linkTo: {
    type: String,
    default: '',
  },
  linkText: {
    type: String,
    default: 'Xem thêm',
  },
})

// ----- Scroll / Drag logic -----
const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

let isDown = false
let startX = 0
let scrollLeft = 0

const onMouseDown = (e) => {
  const el = scrollContainer.value
  if (!el) return
  isDown = true
  el.classList.add('cursor-grabbing')
  startX = e.pageX - el.offsetLeft
  scrollLeft = el.scrollLeft
}

const onMouseUp = () => {
  isDown = false
  scrollContainer.value?.classList.remove('cursor-grabbing')
}

const onMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const el = scrollContainer.value
  const x = e.pageX - el.offsetLeft
  el.scrollLeft = scrollLeft - (x - startX)
}

const scroll = (direction) => {
  const el = scrollContainer.value
  if (!el) return
  const scrollAmount = 300
  el.scrollBy({ left: direction === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' })
}

const checkScroll = () => {
  const el = scrollContainer.value
  if (!el) return

  // Chỉ hiện nút scroll nếu nội dung tràn ra ngoài (scrollWidth > clientWidth)
  const isScrollable = el.scrollWidth > el.clientWidth

  if (!isScrollable) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
  }

  // Dùng Math.ceil để làm tròn, tránh lỗi 1px trên một số màn hình
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth
}

onMounted(() => {
  const el = scrollContainer.value
  if (el) {
    el.addEventListener('scroll', checkScroll)
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
  }
  window.addEventListener('resize', checkScroll)

  // Kiểm tra lần đầu
  nextTick(checkScroll)
})

// ⭐️ THÊM: Kiểm tra lại khi DOM cập nhật (VD: khi API tải xong dữ liệu)
onUpdated(() => {
    checkScroll()
})

onUnmounted(() => {
  const el = scrollContainer.value
  if (el) {
    el.removeEventListener('scroll', checkScroll)
  }
  window.removeEventListener('resize', checkScroll)
})
</script>

<template>
  <div
    class="relative container mx-auto my-8 p-4 bg-slate-50 pt-16 rounded-3xl shadow dark:bg-gray-800 dark:shadow-slate-300 transition-colors duration-300"
  >
    <div class="absolute -top-6 left-1/2 -translate-x-1/2 mb-6 flex justify-center">
      <span
        class="px-10 py-3 rounded-full text-lg lg:text-2xl font-bold bg-gray-100 dark:bg-gray-900 text-primary_hover dark:text-white whitespace-nowrap"
      >
        {{ title }}
      </span>
    </div>

    <div class="relative group">
      <div
        ref="scrollContainer"
        class="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab select-none px-2 py-4 scroll-smooth items-stretch"
      >
        <slot :items="items"></slot>
      </div>

      <template v-if="controls !== 'hidden' && (canScrollLeft || canScrollRight)">
        <button
          v-show="canScrollLeft"
          class="absolute -left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-3 text-primary dark:text-white transition z-20 opacity-0 group-hover:opacity-100"
          @click="scroll('prev')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          v-show="canScrollRight"
          class="absolute -right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-3 text-primary dark:text-white transition z-20 opacity-0 group-hover:opacity-100"
          @click="scroll('next')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </template>
    </div>

    <div v-if="controls !== 'hidden' && (canScrollLeft || canScrollRight)" class="mt-6 flex justify-center">
      <NavLink :label="linkText" :to="linkTo" variant="primary"> </NavLink>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.cursor-grab {
  cursor: grab;
}
.cursor-grabbing {
  cursor: grabbing;
}
</style>
