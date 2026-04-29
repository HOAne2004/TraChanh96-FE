<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/identity/user.store'
import { useOrderStore } from '@/stores/sales/order.store'
import { useRouter, useRoute } from 'vue-router'

// Components
import ProfileInfoForm from '@/components/customer/users/ProfileInfoForm.vue'
import ProfileOrdersHistory from '@/components/customer/users/ProfileOrdersHistory.vue'
import FeatureUnderConstruction from '@/components/ui/FeaturePending.vue'
import ProfileSidebar from '@/components/customer/users/ProfileSidebar.vue'
const userStore = useUserStore()
const orderStore = useOrderStore()
const router = useRouter()
const route = useRoute()

const { user } = storeToRefs(userStore)

const activeTab = ref(route.query.tab || 'info')

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab
    } else {
      activeTab.value = 'info'
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!user.value) {
    router.replace('/login')
    return
  }
  await orderStore.fetchMyOrders()
})
</script>

<template>
  <main class="py-10 max-w-7xl mx-auto px-4 lg:px-8">
    <h1 class="text-4xl font-extrabold mb-8 text-center text-green-700 dark:text-green-400">
      Hồ Sơ Cá Nhân
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div
        class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg h-fit sticky top-24 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <ProfileSidebar :user="user" :is-dropdown="false" class="p-2" />
      </div>

      <div class="lg:col-span-9 space-y-8">
        <ProfileInfoForm v-if="activeTab === 'info'" :user="user" />
        <ProfileOrdersHistory
          v-else-if="activeTab === 'orders'"
          :orders="orderStore.orders"
          :is-loading="orderStore.loading"
        />
        <FeatureUnderConstruction v-else class="w-full" />
      </div>
    </div>
  </main>
</template>
