<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, onUpdated, watch } from 'vue'

const props = defineProps({
  title: String,
  items: Array,

  // 3.1: Props mới như bạn đề xuất
  layout: {
    type: String,
    default: 'horizontal', // 'horizontal' | 'grid'
    validator: (val) => ['horizontal', 'grid'].includes(val),
  },
  initialCount: {
    type: Number,
    default: 8,
  },

  controls: { type: String, default: '' },
  linkTo: { type: String, default: '' },
  linkText: { type: String, default: 'Xem thêm' },
})

// --- 3.2: Logic cho Grid Mode ---
const expanded = ref(false)

const visibleItems = computed(() => {
  if (props.layout !== 'grid') return props.items // Horizontal luôn trả về hết
  if (expanded.value) return props.items
  return props.items.slice(0, props.initialCount)
})

// --- Logic Scroll (Chỉ dùng cho Horizontal) ---
const scrollContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
let isDown = false
let startX = 0
let scrollLeft = 0

// ... (Các hàm onMouseDown, onMouseUp, onMouseMove giữ nguyên logic cũ) ...
const onMouseDown = (e) => {
  if (props.layout !== 'horizontal') return
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
  if (!isDown || props.layout !== 'horizontal') return
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
  // Chỉ check khi ở chế độ Horizontal
  if (props.layout !== 'horizontal') return

  const el = scrollContainer.value
  if (!el) return

  const isScrollable = el.scrollWidth > el.clientWidth
  if (!isScrollable) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth
}

// Lifecycle: Chỉ attach event khi layout là horizontal
const initScrollEvents = () => {
  const el = scrollContainer.value
  if (el && props.layout === 'horizontal') {
    el.addEventListener('scroll', checkScroll)
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', checkScroll)
    checkScroll() // Check ngay
  }
}

const removeScrollEvents = () => {
  const el = scrollContainer.value
  if (el) {
    el.removeEventListener('scroll', checkScroll)
    // ... remove các event khác nếu cần kỹ tính
  }
  window.removeEventListener('resize', checkScroll)
}

onMounted(() => {
  nextTick(() => initScrollEvents())
})

onUpdated(() => {
  if (props.layout === 'horizontal') checkScroll()
})

onUnmounted(() => {
  removeScrollEvents()
})

// Watch layout change để attach/detach event nếu component đổi chế độ động
watch(
  () => props.layout,
  (newVal) => {
    if (newVal === 'horizontal') nextTick(initScrollEvents)
    else removeScrollEvents()
  },
)
</script>

<template>
  <div
    class="relative container mx-auto my-8 p-4 bg-slate-50 pt-16 rounded-3xl shadow dark:bg-gray-800 dark:shadow-slate-300 transition-colors duration-300"
  >
    <div class="absolute -top-6 left-1/2 -translate-x-1/2 mb-6 flex justify-center">
      <span
        class="px-10 py-3 rounded-full text-lg lg:text-2xl font-bold bg-gray-100 dark:bg-gray-900 text-primary_hover dark:text-white whitespace-nowrap shadow-sm"
      >
        {{ title }}
      </span>
    </div>

    <div class="relative titled-container-group group/slider">
      <div
        v-if="layout === 'horizontal'"
        ref="scrollContainer"
        class="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab select-none px-2 py-4 scroll-smooth items-stretch"
      >
        <slot :items="visibleItems"></slot>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 py-4">
        <slot :items="visibleItems"></slot>
      </div>

      <template v-if="layout === 'horizontal' && controls !== 'hidden'">
        <button
          v-show="canScrollLeft"
          class="absolute -left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 rounded-full p-3 text-primary dark:text-white transition z-20 opacity-0 group-hover/slider:opacity-100"
          @click="scroll('prev')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          v-show="canScrollRight"
          class="absolute -right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 rounded-full p-3 text-primary dark:text-white transition z-20 opacity-0 group-hover/slider:opacity-100"
          @click="scroll('next')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </template>
    </div>

    <div
      v-if="layout === 'grid' && items.length > initialCount"
      class="mt-6 flex justify-center"
    ></div>
    <div v-if="layout === 'horizontal' && linkTo" class="mt-6 flex justify-center"></div>
  </div>
</template>

<style scoped>
/* CSS cũ */
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
