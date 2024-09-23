<template>
  <div class="sidebar-item" :class="{ active: active }">
    <SvgAsset class="icon" :icon-name="icon"/>
    <span class="label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import SvgAsset, { SvgAssetIconNames } from '../SvgAsset.vue';
defineProps<{
  icon: SvgAssetIconNames;
  label: string;
  active?: boolean;
}>();
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  /* border-radius: 0.25rem; */
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: #e9ecef;
}

.sidebar-item.active {
  background-color: #e9ecef;
}

.sidebar-item .icon {
  margin-right: 0.5rem;
}

.sidebar-item .label {
    font-size: 14px;
}
</style>
