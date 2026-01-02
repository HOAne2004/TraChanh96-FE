<script setup>
import { onMounted } from 'vue'
import { useBrandStore } from '@/stores/brand'
import { useSocialMediaStore } from '@/stores/socialMedia'
import { storeToRefs } from 'pinia'

const brandStore = useBrandStore()
const socialStore = useSocialMediaStore()

// Lấy các biến reactive từ store
const { brand, loading: brandLoading } = storeToRefs(brandStore)
const { socials, loading: socialLoading } = storeToRefs(socialStore)

onMounted(() => {
  // Gọi hàm fetch dữ liệu
  brandStore.fetchPublicBrandInfo()
  socialStore.fetchActiveSocials()
})
</script>

<template>
  <div class="p-4 grid grid-cols-1 sm:grid-cols-3 w-full bg-white dark:bg-dark dark:text-white">

    <!-- Loading state -->
    <div v-if="brandLoading || socialLoading" class="col-span-3 text-center py-4">
      Đang tải thông tin...
    </div>

    <!-- Main content (chỉ hiện khi không loading) -->
    <template v-else>
      <!-- Logo -->
      <div class="w-full">
        <img src="@logo/logo-footer.png" alt="Logo" />
      </div>

      <!-- Thông tin liên hệ -->
      <div v-if="brand" class="text-left grid gap-2">
        <div v-if="brand.address">
          <p class="font-bold text-primary">Địa chỉ</p>
          <p>{{ brand.address }}</p>
        </div>

        <div v-if="brand.emailSupport">
          <p class="font-bold text-primary">Email hỗ trợ khách hàng</p>
          <p>{{ brand.emailSupport }}</p>
        </div>

        <div v-if="brand.hotline">
          <p class="font-bold text-primary">Hotline</p>
          <p>{{ brand.hotline }}</p>
        </div>
      </div>

      <!-- Social + Email -->
      <div class="flex flex-col gap-4">
        <!-- Social Media -->
        <div v-if="socials.length > 0">
          <p class="mb-2">Theo dõi chúng tôi trên</p>
          <ul class="flex flex-wrap gap-4 text-primary">
            <li
              v-for="social in socials"
              :key="social.id"
              class="hover:opacity-80 transition"
            >
              <a
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="social.platformName"
              >
                <img
                  v-if="social.iconUrl"
                  :src="social.iconUrl"
                  :alt="social.platformName"
                  class="w-8 h-8"
                />
                <span v-else>{{ social.platformName }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Email subscribe -->
        <div>
          <p>Vui lòng để lại email để nhận voucher mới nhất</p>
          <div class="flex gap-2 mt-2">
            <input type="email" placeholder="Nhập email của bạn" class="border p-1 rounded flex-1" />
            <button class="p-2 bg-primary text-white rounded">Gửi</button>
          </div>

          <hr class="my-3" />
          <!-- Hiển thị tên brand nếu có -->
          <p class="text-sm">
            @2025 Bản quyền thuộc {{ brand?.name || 'HOAn' }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
