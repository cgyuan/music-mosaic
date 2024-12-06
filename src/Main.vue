<script setup lang="ts">
import MusicSheet from './music-sheet';
import { usePlayerStore } from '@/store/playerStore';
import { usePluginStore } from '@/store/pluginStore';
import { setupRecentlyPlaylist } from '@/hooks/useRecentPlayed';
import useThemes from '@/hooks/useThemes';
import { listen } from '@tauri-apps/api/event';
import { RepeatMode } from '@/components/NowPlaying/enum';
import { onMounted, watch, computed, ref, provide } from 'vue';
import { useUIStore } from '@/store/uiStore';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/store/settingsStore';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window';
import router from './router';
import { useMagicKeys, whenever } from '@vueuse/core'

const settingsStore = useSettingsStore()

const { loadThemePacks } = useThemes();

const pluginStore = usePluginStore();
pluginStore.$persistedState.isReady().then(() => {
    pluginStore.loadPlugins();
});

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
    await listen('open-settings', async () => {
        showLyricView.value = false;
        await WebviewWindow.getByLabel('mini-player')?.hide();
        await WebviewWindow.getByLabel('main')?.show();
        if (appWindow.label === 'main') {
            router.push('/settings');
        }
    });

    // 添加显示歌词视图的事件监听
    await listen('show-lyric-view', () => {
        showLyricView.value = true;
        WebviewWindow.getByLabel('mini-player')?.hide();
    });

    await listen('window-close-requested', () => {
        if (settingsStore.settings.normal?.closeBehavior === 'minimize') {
            appWindow.hide();
        } else {
            appWindow.close();
        }
    });
});

// Setup keyboard shortcuts
const keys = useMagicKeys({
    passive: false,
    onEventFired(e) {
        // Prevent navigation keys and space default behavior
        if (
            (e.metaKey || e.ctrlKey) && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
            e.code === 'Space'
        ) {
            e.preventDefault()
            e.stopPropagation()
        }
    }
})

// Track recording state
const isRecordingShortcut = ref(false)

// Watch for each shortcut
const shortcuts = computed(() => settingsStore.settings.shortCut?.shortcuts || [])

// Register shortcuts
const registerShortcuts = () => {
    shortcuts.value.forEach(shortcut => {
        const keyCombo = shortcut.shortcut
            .split('+')
            .map(key => key === 'CommandOrControl' ? 'meta' : key.toLowerCase())
            .join('+')

        whenever(keys[keyCombo], () => {
            // Skip if recording or shortcuts disabled
            if (isRecordingShortcut.value || !settingsStore.settings.shortCut?.enableLocal) return
            
            // Skip if in input element
            const target = document.activeElement as HTMLElement
            if (
                target?.tagName === 'INPUT' || 
                target?.tagName === 'TEXTAREA' || 
                target?.isContentEditable ||
                target?.closest('[role="textbox"]')
            ) {
                return
            }

            playerStore.handleShortcut(shortcut.id)
        })
    })
}

// Watch for shortcut changes
watch(() => shortcuts.value, registerShortcuts, { deep: true })

// Initial registration
registerShortcuts()

// Export isRecordingShortcut for use in Shortcut.vue
provide('isRecordingShortcut', isRecordingShortcut)
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
