<template>
  <div class="desktop-lyric" ref="lyricWindow" @mousedown="startDragging">
    <div class="lyric-content">
      <div class="current-lyric">{{ currentLyric }}</div>
      <div class="next-lyric">{{ nextLyric }}</div>
    </div>
    <div class="control-buttons">
      <Button text rounded @click="toggleLock">
        <SvgAsset :iconName="isLocked ? 'lock-closed' : 'lock-open'" :size="16" />
      </Button>
      <Button :style="{
        display: 'none'
      }" text rounded @click="toggleTransparency">
        <SvgAsset iconName="sparkles" :size="16" />
      </Button>
      <Button text rounded @click="closeDesktopLyric">
        <SvgAsset iconName="x-mark" :size="16" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import Button from 'primevue/button';
import SvgAsset from '@/components/SvgAsset.vue';
import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';

const lyricWindow = ref<HTMLElement | null>(null);
const isLocked = ref(false);
const isTransparent = ref(false);

const currentLyric = ref('暂无歌词');
const nextLyric = ref('');

// 监听歌词更新事件
let unlisten: (() => void) | null = null;

onMounted(async () => {
  // 监听歌词更新事件
  unlisten = await listen('desktop-lyric-update', (event) => {
    const { currentLyric: newCurrentLyric, nextLyric: newNextLyric } = event.payload as {
      currentLyric: string;
      nextLyric: string;
    };
    currentLyric.value = newCurrentLyric;
    nextLyric.value = newNextLyric;
  });

  // 监听播放器状态变化
  await listen('player-state-update', (event) => {
    const state = event.payload as {
      isPlaying: boolean;
      currentTrack: IMusic.IMusicItem | null;
    };
    
    if (!state.currentTrack) {
      currentLyric.value = '暂无歌词';
      nextLyric.value = '';
    }
  });

  // Add listener for tray lock control
  await listen('tray-lyric-lock-control', async (event) => {
    const command = event.payload as string;
    if (command === 'toggle') {
      await toggleLock();
    }
  });
});

onUnmounted(() => {
  if (unlisten) {
    unlisten();
  }
});

const startDragging = (_event: MouseEvent) => {
  if (!isLocked.value) {
    appWindow.startDragging();
  }
};

const toggleLock = async () => {
  isLocked.value = !isLocked.value;
  await invoke('update_tray_lyric_lock_state', { locked: isLocked.value });
};

const toggleTransparency = () => {
  isTransparent.value = !isTransparent.value;
  if (lyricWindow.value) {
    // lyricWindow.value.style.opacity = isTransparent.value ? '0.3' : '1';
    lyricWindow.value.style.backgroundColor = isTransparent.value ? 'transparent' : 'rgba(0, 0, 0, 0.7)';
  }
};

const closeDesktopLyric = async () => {
  await appWindow.hide();
  await emit('desktop-lyric-state', { visible: false });
};
</script>

<style scoped>
.desktop-lyric {
  width: 100%;
  height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  /* border-radius: 8px; */
  padding: 8px;
  transition: opacity 0.3s ease;
}

.desktop-lyric:hover {
  background: rgba(0, 0, 0, 0.3);
}

.lyric-content {
  text-align: center;
}

.current-lyric, .next-lyric {
  transition: all 0.3s ease;
}

.current-lyric {
  font-size: 30px;
  font-weight: bold;
  color: var(--primaryColor);
  margin-bottom: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.next-lyric {
  font-size: 14px;
  opacity: 0.7;
  color: rgba(255, 255, 255, 0.8);
  display: none;
}

.control-buttons {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.desktop-lyric:hover .control-buttons {
  opacity: 1;
}

:deep(.p-button.p-button-text) {
  color: white !important;
  padding: 4px;
}

:deep(.p-button.p-button-text:hover) {
  background: rgba(255, 255, 255, 0.2);
}
</style> 