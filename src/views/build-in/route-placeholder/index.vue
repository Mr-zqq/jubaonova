<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({
  name: 'RoutePlaceholder',
})

const route = useRoute()
</script>

<template>
  <n-card title="页面尚未配置">
    <n-space vertical :size="12">
      <n-text>菜单“{{ route.meta.title }}”（{{ route.path }}）还没有对应的前端页面。</n-text>
      <n-text depth="3">请在菜单管理中为该菜单配置正确的组件路径，或联系开发补充页面。</n-text>
    </n-space>
  </n-card>
</template>