<template>
    <div class="minimode-page-container">
        <div class="minimode-header-container" @mousedown="startDragging" @mouseenter="hover = true"
            @mouseleave="hover = false">
            <div class="mini-mode-header-background-mask"></div>
            <div class="mini-mode-header-background" :style="{
                backgroundImage: `url(${currentTrack?.artwork || currentTrack?.coverImg || albumCover})`
            }"></div>
            <div class="content-wrapper">
                <img class="album-container" :src="currentTrack?.artwork || currentTrack?.coverImg || albumCover"
                    :title="currentTrack?.title" draggable="false" />
                <div class="body-container">
                    <div v-if="!hover" class="text-container">
                        <span>{{ currentLyricText }}</span>
                    </div>
                    <div v-else class="options-container">
                        <div class="close-button no-drag" @mousedown.stop @click="hideMiniPlayer">
                            <SvgAsset iconName="x-mark" :size="16" />
                        </div>
                        <div class="option-item no-drag" @mousedown.stop @click="previousTrack">
                            <SvgAsset iconName="skip-left" :size="28" />
                        </div>
                        <div class="option-item no-drag" @mousedown.stop @click="togglePlay">
                            <SvgAsset :iconName="isPlaying ? 'pause' : 'play'" :size="28" />
                        </div>
                        <div class="option-item no-drag" @mousedown.stop @click="nextTrack">
                            <SvgAsset iconName="skip-right" :size="28" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import SvgAsset from '@/components/SvgAsset.vue';
import { storeToRefs } from 'pinia';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { appWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/window';

const hover = ref(false);
const playerStore = usePlayerStore();
const { isPlaying, currentTrack } = storeToRefs(playerStore);
const currentLyricText = ref('');
appWindow.setResizable(false);

// 初始化时设置事件监听
onMounted(() => {
    // 确保迷你播放器窗口也能接收到主窗口的状态更新
    listen<{ isPlaying: boolean, currentTrack: IMusic.IMusicItem }>('player-state-changed', (event) => {
        playerStore.$patch({
            isPlaying: event.payload.isPlaying,
            currentTrack: event.payload.currentTrack
        });
    });
    listen('current-lyric-text', (event) => {
        currentLyricText.value = event.payload as string;
    });
});

const startDragging = () => {
    appWindow.startDragging();
};

const togglePlay = async () => {
    if (isPlaying.value) {
        await emit('player-control', { type: 'pause' });
    } else {
        await emit('player-control', { type: 'play' });
    }
};

const previousTrack = async () => {
    await emit('player-control', { type: 'previous' });
};

const nextTrack = async () => {
    await emit('player-control', { type: 'next' });
};

const hideMiniPlayer = async () => {
    hover.value = false;
    await appWindow.hide();
    WebviewWindow.getByLabel('main')?.show();
};
</script>

<style scoped>
.minimode-page-container {
    width: 100%;
    height: 72px;
    background-color: transparent;
    user-select: none;
}

.minimode-header-container {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: move;
}

.content-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px;
    height: 100%;
}

.mini-mode-header-background-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background-color: rgba(51, 51, 51, 0.95);
    /* border-radius: 6px; */
    backdrop-filter: blur(10px);
}

.mini-mode-header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
    opacity: 0.6;
    transition: all 300ms ease-in-out;
    filter: blur(15px);
    /* border-radius: 6px; */
}

.album-container {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    object-fit: cover;
}

.body-container {
    flex: 1;
    height: 100%;
    font-size: 13px;
    position: relative;
}

.text-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: white;
}

.options-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding-right: 48px;
}

.close-button {
    position: absolute;
    right: 0;
    top: 0;
    color: white;
    cursor: pointer;
}

.option-item {
    color: white;
    opacity: 0.8;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.option-item:hover {
    opacity: 1;
}

.no-drag {
    cursor: pointer;
}
</style>