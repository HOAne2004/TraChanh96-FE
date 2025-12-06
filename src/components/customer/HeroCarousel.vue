<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { storeToRefs } from 'pinia'

// Import ảnh mặc định
import defaultHero from '@/assets/images/banners/default-hero.jpg'
import defaultHero2 from '@/assets/images/banners/default-hero-2.jpg'
const appStore = useAppStore()
const currentIndex = ref(0)
let intervalId

const { carousel: slides } = storeToRefs(appStore)

// Tạo một computed để quyết định hiển thị slides thật hay ảnh mặc định
const displaySlides = computed(() => {
  const baseUrl = 'https://trachanh96-be-production.up.railway.app'

  if (slides.value && slides.value.length > 0) {
    return slides.value.map(s => {
      // ⭐️ FIX: Kiểm tra s.image TRƯỚC khi gọi bất kỳ method nào
      const imageUrl = s.image;

      return {
        ...s,
        image: imageUrl
               && imageUrl.startsWith('http')
               ? imageUrl
               : `${baseUrl}${imageUrl || ''}` // Nếu null, dùng link base + rỗng
      };
    });
  }

  // Nếu không có dữ liệu, trả về mảng chứa 2 phần tử ảnh mặc định
  return [
    {
    id: 'default',
    image: defaultHero, // Sử dụng ảnh import
    title: 'Chào mừng đến với Trà Chanh 96'
  },
  {
    id: 'default2',
    image: defaultHero2,
    title: 'Tận hưởng hương trà'
  },

]
})

onMounted(async() => {
  await appStore.fetchCarousel()

  // Chỉ chạy auto-play nếu có nhiều hơn 1 slide
  if(displaySlides.value.length > 1){
    intervalId = setInterval(() =>{
      currentIndex.value = (currentIndex.value + 1) % displaySlides.value.length
    }, 3500)
  }
})

onUnmounted(() =>{
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative max-w-full h-[300px] lg:h-[600px] overflow-hidden group">
    <div
      v-for="(s, index) in displaySlides"
      :key="s.id"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="{ 'opacity-100': currentIndex === index, 'opacity-0': currentIndex !== index }"
    >
      <img
        :src="s.image"
        alt="Banner"
        class="w-full h-full object-cover"
        @error="(e) => { e.target.src = defaultHero }"
        loading="lazy"
      />

      <div
        v-if="s.title"
        class="absolute inset-0 flex flex-col justify-end pb-12 items-center text-white text-center bg-gradient-to-t from-black/60 to-transparent"
      >
        <h2 class="text-xl md:text-4xl font-bold drop-shadow-md tracking-wide mb-2">
            {{ s.title }}
        </h2>
      </div>
    </div>

    <div v-if="displaySlides.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(s, index) in displaySlides"
        :key="s.id"
        class="w-3 h-3 rounded-full transition-all duration-300"
        :class="currentIndex === index ? 'bg-green-500 scale-125' : 'bg-gray-300/80 hover:bg-white'"
        @click="currentIndex = index"
      ></button>
    </div>
  </div>
</template>
