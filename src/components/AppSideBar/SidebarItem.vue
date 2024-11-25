<template>
  <div class="sidebar-item" :class="{ active: active }">
    <SvgAsset class="icon" :icon-name="icon" :size="18" />
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
  color: var(--textColor);
}

.sidebar-item:hover {
  background: var(--listHoverColor);
}

.sidebar-item.active {
  background: var(--listHoverColor);
  color: var(--primaryColor);
}

.sidebar-item .icon {
  margin-right: 0.5rem;
}

.sidebar-item .label {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
