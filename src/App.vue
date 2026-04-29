<script setup>
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/system/uiStore.store'
import { useUserStore } from '@/stores/identity/user.store'
import { useModalStore } from '@/stores/system/modal.store'
import AppToast from '@/components/AppToast.vue'
import GlobalModal from '@/components/GlobalModal.vue'

const ui = useUIStore()
const userStore = useUserStore()
const modalStore = useModalStore()

onMounted(() => {
  ui.initTheme()

  userStore.fetchUserProfile()
})
</script>

<template>
  <RouterView />
  <AppToast />
  <GlobalModal v-if="modalStore.isVisible" />
</template>
