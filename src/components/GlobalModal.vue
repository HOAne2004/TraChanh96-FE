<template>
  <AppModal
    :is-visible="modal.isVisible && modal.modalConfig"
    :type="modal.modalConfig?.type"
    :title="modal.modalConfig?.title"
    :message="modal.modalConfig?.message"
    :subtitle="modal.modalConfig?.subtitle"
    :confirm-button-text="modal.modalConfig?.confirmButtonText"
    :cancel-button-text="modal.modalConfig?.cancelButtonText"
    :show-cancel-button="modal.modalConfig?.showCancelButton"
    :backdrop-close="modal.modalConfig?.backdropClose"
    :esc-close="modal.modalConfig?.escClose"
    @confirm="modal.confirm"
    @cancel="modal.cancel"
    @close="modal.hide"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/modal'
import AppModal from '@/components/AppModal.vue'

const modal = useModalStore()
</script>
