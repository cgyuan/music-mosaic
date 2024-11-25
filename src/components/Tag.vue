<template>
  <div
    class="components--tag-container"
    :title="$slots.default?.()?.[0]?.children?.toString()"
    :data-fill="fill"
    :style="style"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { CSSProperties } from 'vue'

interface Props {
  fill?: boolean
  style?: CSSProperties
}

defineProps<Props>()
</script>

<style scoped>
.components--tag-container {
  font-size: 0.9rem;
  color: var(--primaryColor);
  border: 1px solid var(--primaryColor);
  border-radius: 12px;
  padding: 2px 6px;
  width: fit-content;
  max-width: 7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  flex-shrink: 0;
}

.components--tag-container[data-fill="true"] {
  background-color: var(--primaryColor);
  color: white;
}
</style>
