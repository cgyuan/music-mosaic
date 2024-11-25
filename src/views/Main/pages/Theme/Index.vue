<template>
    <div class="theme-container">
        <div class="tabs-wrapper">
            <span v-for="(item, index) in tabs" :key="index" class="tab-item"
                :class="{ 'active': activeIndex === index }" @click="activeIndex = index">
                {{ item }}
            </span>
        </div>
        <div class="tab-content">
            <component :is="activeComponent" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import LocalTheme from './LocalTheme.vue';
import ThemeMarket from './ThemeMarket.vue';
import useThemes from '@/hooks/useThemes';

const { loadRemoteThemes } = useThemes();

const tabs = ['本地主题', '主题市场'];
const activeIndex = ref(0);
const activeComponent = computed(() => {
    switch (activeIndex.value) {
        case 0: return LocalTheme;
        case 1: return ThemeMarket;
    }
});

onMounted(() => {
    loadRemoteThemes();
})
</script>

<style scoped>
.theme-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.tabs-wrapper {
  display: flex;
  gap: 20px;
  margin-bottom: 5px;
  border-bottom: 1px solid transparent;
  padding: 0 20px;
}

.tab-item {
  cursor: pointer;
  padding: 10px 0;
  font-size: 16px;
  color: var(--textColor);
  position: relative;
  opacity: 0.7;
}

.tab-item.active {
  color: var(--primaryColor);
  opacity: 1;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primaryColor);
}

.tab-content {
    flex: 1;
    overflow: auto;
}

</style>
