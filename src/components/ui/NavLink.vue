<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  label: { type: String, default: '' },
  to: { type: [String, Object], required: true },
  variant: { type: String, default: 'nav' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  badge: { type: [String, Number], default: null },
})

const route = useRoute()

const isActive = computed(() => {
  return typeof props.to === 'string' ? route.path === props.to : route.path === props.to.path
})

const classes = computed(() => {
  const base =
    'relative inline-flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all duration-300 rounded-lg whitespace-nowrap' // 🚨 Thêm justify-center và whitespace-nowrap

  const variants = {
    nav: `
      text-green-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500
      hover:scale-[1.05]
      after:content-[''] after:absolute after:bottom-1 after:left-0 
      after:w-0 after:h-[2px] after:bg-green-600 
      after:transition-all after:duration-300 
      hover:after:w-full
    `,
    profile: `
      block text-left text-gray-800 dark:text-gray-100 
      hover:bg-gray-100 dark:hover:bg-gray-700
    `,
    outline: `
      border border-green-600 text-green-600 p-2 rounded-full 
      hover:bg-green-50 transition-colors duration-200
    `,
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'text-green-600 hover:underline dark:text-green-400',
  }
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  const activeClass = isActive.value
    ? props.variant === 'outline'
      ? 'bg-green-100 border-green-700 text-green-700'
      : 'text-green-700 font-semibold after:w-full after:bg-green-700' // 🚨 SỬA LỚP ACTIVE
    : ''

  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return [
    base,
    sizes[props.size],
    variants[props.variant] || variants.nav,
    activeClass,
    disabledClass,
  ].join(' ')
})
</script>

<template>
  <div class="relative inline-flex">
    <RouterLink :to="to" :class="classes" :aria-disabled="disabled">
      <slot name="icon"></slot>

      <slot>{{ label }}</slot>
    </RouterLink>

    <span
      v-if="Number(badge) > 0"
      class="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-10"
    >
      {{ badge }}
    </span>
  </div>
</template>
