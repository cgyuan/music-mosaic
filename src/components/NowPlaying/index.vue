<template>
    <div>
        <div class="now-playing music-bar-container">
            <div class="progress-container">
                <Slider v-model="progress" class="progress-slider" />
            </div>
            <div class="content">
                <div class="left-section" :style="{
                    visibility: currentTrack ? 'visible' : 'hidden'
                }">
                    <div class="album-cover-container" @click="toggleLyricView">
                        <img class="album-cover" :src="currentTrack?.artwork || currentTrack?.coverImg || albumCover"
                            :alt="currentTrack?.title">
                        <div class="album-cover-overlay">
                            <SvgAsset :iconName="showLyricView ? 'chevron-double-down' : 'chevron-double-up'" :size="24"
                                color="white" />
                        </div>
                    </div>
                    <div class="song-details">
                        <div class="song-title">{{ currentTrack?.title || 'No track selected' }}</div>
                        <div class="artist-and-time">
                            <span class="artist text-ellipsis">{{ currentTrack?.artist || 'Unknown artist' }}</span>
                            <span class="playback-time">{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span>
                        </div>
                    </div>
                    <div class="song-source">{{ currentTrack?.platform || 'Unknown source' }}</div>
                </div>
                <div class="center-section">
                    <div class="playback-controls">
                        <div class="controller-button skip">
                            <SvgAsset iconName="skip-left" @click="previousTrack"></SvgAsset>
                        </div>
                        <div class="controller-button play-or-pause primary-btn">
                            <SvgAsset :iconName="isPlaying ? 'pause' : 'play'" @click="togglePlay"></SvgAsset>
                        </div>
                        <div class="controller-button skip">
                            <SvgAsset iconName="skip-right" @click="nextTrack"></SvgAsset>
                        </div>
                    </div>
                </div>
                <div class="right-section">
                    <div class="volume-control" @mouseenter="showVolumePopover" @mouseleave="hideVolumePopover">
                        <Button text rounded @click="toggleMute">
                            <SvgAsset :iconName="mute ? 'speaker-x-mark' : 'speaker-wave'" :size="22" />
                        </Button>
                        <div v-if="isVolumePopoverVisible" class="volume-popover">
                            <Slider v-model="volume" orientation="vertical" :min="0" :max="1" :step="0.01" />
                            <label for="volume">{{ `${(playerStore.volume * 100).toFixed(0)}%` }}</label>
                        </div>
                    </div>
                    <Button text rounded>
                        <SvgAsset iconName="lyric" :size="22" />
                    </Button>
                    <Button text rounded @click="toggleRepeatMode">
                        <SvgAsset :iconName="repeatModeIcon" :size="22" />
                    </Button>
                    <Button text rounded @click="togglePlaylistDrawer">
                        <SvgAsset iconName="playlist" :size="22" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, Ref, computed, ref } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import Button from 'primevue/button';
import Slider from 'primevue/slider';
import PlaylistDrawer from '@/components/PlaylistDrawer.vue';
import { storeToRefs } from 'pinia';
import { RepeatMode } from './enum';
import SvgAsset from '../SvgAsset.vue';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { useUIStore } from '@/store/uiStore';

const playerStore = usePlayerStore();
const { volume, isPlaying, mute } = storeToRefs(playerStore);

const uiStore = useUIStore();
const { showLyricView } = storeToRefs(uiStore);

const progress = computed({
    get: () => playerStore.progress,
    set: (value) => playerStore.seek(value)
});

const currentTrack = computed(() => playerStore.currentTrack);
const currentTime = computed(() => playerStore.currentTime);
const duration = computed(() => playerStore.duration);

const togglePlay = () => {
    if (!currentTrack.value) return;
    if (isPlaying.value) {
        playerStore.pause();
    } else {
        playerStore.play();
    }
};

const toggleMute = () => {
    playerStore.toggleMute();
};

const previousTrack = () => {
    if (!currentTrack.value) return;
    playerStore.previousTrack();
};

const nextTrack = () => {
    if (!currentTrack.value) return;
    playerStore.nextTrack();
};

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const playlistDrawer = inject('playlistDrawer') as Ref<InstanceType<typeof PlaylistDrawer>>;

const togglePlaylistDrawer = () => {
    if (playlistDrawer.value) {
        playlistDrawer.value.visible = !playlistDrawer.value.visible;
    }
};

const isVolumePopoverVisible = ref(false);

const showVolumePopover = () => {
    isVolumePopoverVisible.value = true;
};

const hideVolumePopover = () => {
    isVolumePopoverVisible.value = false;
};

const repeatModeIcon = computed(() => {
    switch (playerStore.repeatMode) {
        case RepeatMode.Shuffle: return 'shuffle';
        case RepeatMode.Queue: return 'repeat-song-1';
        case RepeatMode.Loop: return 'repeat-song';
    }
});

const toggleRepeatMode = () => {
    const modes = [RepeatMode.Queue, RepeatMode.Loop, RepeatMode.Shuffle];
    const currentIndex = modes.indexOf(playerStore.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    playerStore.setRepeatMode(modes[nextIndex]);
};

const toggleLyricView = () => {
    showLyricView.value = !showLyricView.value;
};

</script>

<style scoped>
.now-playing {
    display: flex;
    flex-direction: column;
    z-index: 999;
    position: relative;
    height: 64px;
}

.progress-container {
    height: 4px;
}

.progress-slider {
    margin: 0;
    padding: 0;
}

.content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.album-cover-container {
    position: relative;
    width: 48px;
    height: 48px;
}

.album-cover {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    object-fit: cover;
}

.album-cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 4px;
}

.album-cover-container:hover .album-cover-overlay {
    opacity: 1;
}

.album-cover-overlay i {
    color: white;
    font-size: 1.5rem;
}

.song-details {
    display: flex;
    width: 150px;
    flex-direction: column;
}

.song-title {
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: var(--textColor);
}

.artist-and-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--textColor);
}

.playback-time {
    font-size: 0.8rem;
}

.song-source {
    font-size: 1rem;
    color: white;
    background-color: var(--primaryColor);
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.center-section {
    display: flex;
    justify-content: center;
    flex: 1;
}

.playback-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.play-button {
    font-size: 1.5rem;
    color: #ff5722 !important;
}

.controller-button {
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    margin-right: 8px;
    color: var(--textColor);
}

.play-or-pause {
    width: 40px;
    height: 40px;
}

.play-or-pause .svg {
    width: 24px;
    height: 24px;
}

.primary-btn {
    background-color: var(--primaryColor);
    color: white;
}

.right-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
}

:deep(.p-button.p-button-text) {
    color: var(--textColor) !important;
}

:deep(.p-slider) {
    height: 2px;
    border: none;
    background: #e9ecef;
    transition: height 0.15s ease;
}

:deep(.progress-slider.p-slider:hover),
:deep(.progress-slider.p-slider.dragging) {
    height: 4px;
}

:deep(.p-slider-range) {
    background: var(--primaryColor);
}

.progress-slider :deep(.p-slider-handle) {
    display: none;
}

:deep(.progress-slider.p-slider:hover .p-slider-handle),
:deep(.progress-slider.p-slider.dragging .p-slider-handle) {
    display: block;
    cursor: default;
    opacity: 1;
    width: 16px;
    height: 16px;
    margin-top: -8px;
    margin-left: -8px;
    border: none;
    background: transparent;
}

:deep(.p-slider-handle:focus-visible) {
    outline: none;
    outline-offset: 0;
}

:deep(.p-slider:hover) {
    cursor: pointer;
}

:deep(.p-slider.p-component) {
    padding: 0;
}

.volume-control {
    position: relative;
}

.volume-popover {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 50px;
    transform: translateX(-50%);
    background-color: var(--backgroundColor);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    padding: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 99999;
}

.volume-popover label {
    font-size: 0.8rem;
    color: var(--textColor);
}

:deep(.p-slider-vertical) {
    height: 100px;
    margin-top: 0.5rem;
}
</style>

<script lang="ts">
export default {
    mounted() {
        const slider = this.$el.querySelector('.progress-slider');
        if (slider) {
            slider.addEventListener('mousedown', () => slider.classList.add('dragging'));
            document.addEventListener('mouseup', () => slider.classList.remove('dragging'));
        }
    }
}
</script>