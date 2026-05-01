<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useBannerStore } from '@/stores/marketing/banner.store'
import { storeToRefs } from 'pinia'
import { resolveImage } from '@/utils/image'

// Import ảnh mặc định để dùng làm dữ liệu giả khi chưa có API
import defaultHero from '@/assets/images/banners/default-hero.jpg'
import defaultHero2 from '@/assets/images/banners/default-hero-2.jpg'

const bannerStore = useBannerStore()
const currentIndex = ref(0)
let intervalId

const { banners: slides } = storeToRefs(bannerStore)

const displaySlides = computed(() => {
  // Nếu có dữ liệu từ Backend
  if (slides.value && slides.value.length > 0) {
    // Giới hạn tối đa 5 banner
    return slides.value.slice(0, 5).map((s) => ({
      ...s,
      // Sửa lỗi mapping: Dùng `s.imageUrl` thay vì `s.image`
      displayImage: resolveImage(s.imageUrl)
    }))
  }

  // Fallback: Nếu API chưa trả về hoặc đang lỗi, hiện 2 banner mặc định
  return [
    {
      id: 'default-1',
      displayImage: defaultHero,
      title: 'Chào mừng đến với Trà Chanh 1996',
      subtitle: 'Nơi kết nối những tâm hồn yêu trà',
      linkUrl: '/products'
    },
    {
      id: 'default-2',
      displayImage: defaultHero2,
      title: 'Tận hưởng hương trà truyền thống',
      subtitle: 'Đậm đà hương vị tự nhiên',
      linkUrl: '/news'
    },
  ]
})

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % displaySlides.value.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + displaySlides.value.length) % displaySlides.value.length
}

const setSlide = (index) => {
  currentIndex.value = index
}

onMounted(async () => {
  // Lấy tất cả banner thay vì chỉ lấy 'Home-Top' để đảm bảo lấy đủ số lượng
  await bannerStore.fetchBanners()

  if (displaySlides.value.length > 1) {
    intervalId = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative w-full h-[400px] lg:h-[650px] overflow-hidden group bg-gray-900 font-sans">
    <div
      v-for="(s, index) in displaySlides"
      :key="s.id || index"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="{ 'opacity-100 z-10': currentIndex === index, 'opacity-0 z-0 pointer-events-none': currentIndex !== index }"
    >
      <!-- Background Image with Zoom Effect -->
      <img
        :src="s.displayImage"
        :alt="s.title"
        class="w-full h-full object-cover transition-transform duration-[7000ms] ease-out"
        :class="{ 'scale-110': currentIndex === index, 'scale-100': currentIndex !== index }"
        v-img-fallback="'default'"
        loading="eager"
      />

      <!-- Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      <!-- Content -->
      <div
        v-if="s.title"
        class="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4"
      >
        <div 
          class="transition-all duration-1000 transform max-w-4xl"
          :class="{ 'translate-y-0 opacity-100 delay-300': currentIndex === index, 'translate-y-10 opacity-0': currentIndex !== index }"
        >
          <h2 class="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
            {{ s.title }}
          </h2>
          
          <p v-if="s.subtitle" class="text-lg md:text-2xl font-light text-gray-200 mb-8 drop-shadow-md">
            {{ s.subtitle }}
          </p>

          <RouterLink 
            v-if="s.linkUrl" 
            :to="s.linkUrl"
            class="inline-block bg-primary hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Khám Phá Ngay
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button 
      v-if="displaySlides.length > 1"
      @click="prevSlide" 
      class="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
      aria-label="Previous slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    
    <button 
      v-if="displaySlides.length > 1"
      @click="nextSlide" 
      class="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
      aria-label="Next slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    <!-- Navigation Indicators -->
    <div
      v-if="displaySlides.length > 1"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20"
    >
      <button
        v-for="(_, index) in displaySlides"
        :key="index"
        @click="setSlide(index)"
        class="h-2 transition-all duration-300 rounded-full cursor-pointer"
        :class="currentIndex === index ? 'w-10 bg-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'w-2 bg-white/50 hover:bg-white/80'"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
</template>
