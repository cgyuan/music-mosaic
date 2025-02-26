<script setup lang="ts">
import { computed, ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { appWindow } from '@tauri-apps/api/window';

// 动态导入 Main 组件
const Main = defineAsyncComponent(() => import('./Main.vue'));

const route = useRoute();
const currentWindowLabel = ref('');

onMounted(async () => {
  currentWindowLabel.value = appWindow.label;
  console.log('Current window label:', currentWindowLabel.value);
  if (currentWindowLabel.value === 'main') {
    document.body.classList.add('main-window');
  }
});

// 判断当前是哪个窗口
const windowType = computed(() => {
  // 优先使用窗口标签判断
  if (currentWindowLabel.value === 'mini-player') {
    return 'mini-player';
  } else if (currentWindowLabel.value === 'desktop-lyric') {
    return 'desktop-lyric';
  } else if (currentWindowLabel.value === 'main') {
    return 'main';
  }
  
  // 降级使用路由判断
  if (route.path.startsWith('/mini-player')) {
    return 'mini-player';
  } else if (route.path.startsWith('/desktop-lyric')) {
    return 'desktop-lyric';
  }
  return 'main';
});

// 是否显示主窗口内容
const showMainContent = computed(() => windowType.value === 'main');
</script>

<template>
  <router-view v-if="!showMainContent"></router-view>
  <Suspense v-else>
    <Main />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<style>
/* 为桌面歌词和迷你播放器窗口添加透明背景 */
:root {
  --backgroundColor: transparent;
}

/* 主窗口保持原有样式 */
.main-window {
  background-color: var(--backgroundColor);
}

/* 确保桌面歌词和迷你播放器窗口内容可以正确显示 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* 桌面歌词和迷你播放器窗口应该允���拖动 */
body:not(.main-window) {
  -webkit-app-region: drag;
}

/* 控制按钮等交互元素不应该被拖动 */
button, input, .control-buttons, [role="button"] {
  -webkit-app-region: no-drag;
}
</style>
