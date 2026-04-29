<script setup>
import { ref, computed } from 'vue'

import AdminDataTable from '@/components/admin/common/AdminDataTable.vue'
import PageHeader from '@/components/admin/common/PageHeader.vue'
import FeatureUnderConstruction from '@/components/ui/FeatureUnderConstruction.vue'
</script>
<template>
  <div>
    <PageHeader title="Danh sách Quản lý"> </PageHeader>

    <FeatureUnderConstruction
      title="Danh sách Quản lý"
      message="Tính năng đang phát triển"
    ></FeatureUnderConstruction>
  </div>
</template>
