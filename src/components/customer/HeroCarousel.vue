<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useBannerStore } from '@/stores/banner'
import { storeToRefs } from 'pinia'
import { resolveImage } from '@/utils/image'

// Import ảnh mặc định
import defaultHero from '@/assets/images/banners/default-hero.jpg'
import defaultHero2 from '@/assets/images/banners/default-hero-2.jpg'
import funDefault from '@/assets/images/banners/fun-default.png'

const bannerStore = useBannerStore()
const currentIndex = ref(0)
let intervalId

const { banners: slides } = storeToRefs(bannerStore)

// Tạo một computed để quyết định hiển thị slides thật hay ảnh mặc định
const displaySlides = computed(() => {
  if (slides.value && slides.value.length > 0) {
    return slides.value.map((s) => {
      return {
        ...s,
        image: resolveImage(s.image, funDefault),
      }
    })
  }

  // Nếu không có dữ liệu, trả về mảng chứa 2 phần tử ảnh mặc định
  return [
    {
      id: 'default',
      image: defaultHero, // Sử dụng ảnh import
      title: 'Chào mừng đến với Trà Chanh 96',
    },
    {
      id: 'default2',
      image: defaultHero2,
      title: 'Tận hưởng hương trà',
    },
  ]
})

onMounted(async () => {
  await bannerStore.fetchBanners()

  // Chỉ chạy auto-play nếu có nhiều hơn 1 slide
  if (displaySlides.value.length > 1) {
    intervalId = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % displaySlides.value.length
    }, 3500)
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative max-w-full h-[300px] lg:h-[600px] overflow-hidden group bg-gray-200">
    <div
      v-for="(s, index) in displaySlides"
      :key="s.id || index"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="{ 'opacity-100': currentIndex === index, 'opacity-0': currentIndex !== index }"
    >
      <img
        :src="s.imageUrl"
        :alt="s.title || 'Banner'"
        class="w-full h-full object-cover"
        @error="(e) => { e.target.src = funDefault }"
        loading="lazy"
      />

      <div
        v-if="s.title"
        class="absolute inset-0 flex flex-col justify-end pb-12 items-center text-white text-center bg-gradient-to-t from-black/60 via-transparent to-transparent"
      >
        <h2 class="text-xl md:text-4xl font-bold drop-shadow-md tracking-wide mb-2 px-4">
          {{ s.title }}
        </h2>
      </div>
    </div>

    <div
      v-if="displaySlides.length > 1"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
    >
      <button
        v-for="(s, index) in displaySlides"
        :key="s.id || index"
        class="w-3 h-3 rounded-full transition-all duration-300 border border-white/50"
        :class="currentIndex === index ? 'bg-green-500 scale-125 border-green-500' : 'bg-gray-300/50 hover:bg-white'"
        @click="currentIndex = index"
      ></button>
    </div>
  </div>
</template>
