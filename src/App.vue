<script setup lang="ts">
import MusicSheet from './music-sheet';
import { usePlayerStore } from '@/store/playerStore';
import { usePluginStore } from '@/store/pluginStore';
import { setupRecentlyPlaylist } from '@/hooks/useRecentPlayed';
import useThemes from '@/hooks/useThemes';
import { listen } from '@tauri-apps/api/event';
import { RepeatMode } from '@/components/NowPlaying/enum';
import { onMounted } from 'vue';
import { useUIStore } from '@/store/uiStore';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/store/settingsStore';

const settingsStore = useSettingsStore()

const { loadThemePacks } = useThemes();

const pluginStore = usePluginStore();
pluginStore.$persistedState.isReady().then(() => {
    pluginStore.loadPlugins();
});

settingsStore.$persistedState.isReady().then(() => {
    console.log('settingsStore', settingsStore.settings)
})

const playerStore = usePlayerStore();
playerStore.$persistedState.isReady().then(() => {
    playerStore.init();
});

MusicSheet.frontend.setupMusicSheets();
setupRecentlyPlaylist();
loadThemePacks();

const uiStore = useUIStore();
const { showLyricView } = storeToRefs(uiStore);

// 设置托盘事件监听
onMounted(async () => {
    // 播放控制事件
    await listen('tray-playback-control', (event) => {
        const command = event.payload as string;
        switch (command) {
            case 'toggle':
                if (playerStore.isPlaying) {
                    playerStore.pause();
                } else {
                    playerStore.play();
                }
                break;
            case 'prev':
                playerStore.previousTrack();
                break;
            case 'next':
                playerStore.nextTrack();
                break;
        }
    });

    // 播放模式事件
    await listen('tray-playback-mode', (event) => {
        const mode = event.payload as string;
        switch (mode) {
            case 'single':
                playerStore.setRepeatMode(RepeatMode.Loop);
                break;
            case 'list':
                playerStore.setRepeatMode(RepeatMode.Queue);
                break;
            case 'random':
                playerStore.setRepeatMode(RepeatMode.Shuffle);
                break;
        }
    });

    // 歌词控制事件
    await listen('tray-lyric-control', (event) => {
        const command = event.payload as string;
        switch (command) {
            case 'toggle':
                // 实现开启/关闭桌面歌词的逻辑
                break;
            case 'lock':
                // 实现锁定/解锁桌面歌词的逻辑
                break;
        }
    });

    // 设置事件
    await listen('open-settings', () => {
        // 实现打开设置页面的逻辑
    });

    // 添加显示歌词视图的事件监听
    await listen('show-lyric-view', () => {
        showLyricView.value = true;
    });
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
