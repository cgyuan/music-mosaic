<template>
    <div class="now-playing">
        <Slider v-model="progress" class="progress-slider" />
        <div class="content">
            <div class="left-section">
                <img class="album-cover" :src="currentTrack?.artwork || currentTrack?.coverImg"
                    :alt="currentTrack?.title">
                <div class="song-details">
                    <div class="song-title">{{ currentTrack?.title || 'No track selected' }}</div>
                    <div class="artist-and-time">
                        <span class="artist">{{ currentTrack?.artist || 'Unknown artist' }}</span>
                        <span class="playback-time">{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span>
                    </div>
                </div>
                <div class="song-source">{{ currentTrack?.platform || 'Unknown source' }}</div>
            </div>
            <div class="center-section">
                <div class="playback-controls">
                    <Button icon="pi pi-step-backward" text rounded @click="previousTrack" />
                    <Button :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'" text rounded class="play-button"
                        @click="togglePlay" />
                    <Button icon="pi pi-step-forward" text rounded @click="nextTrack" />
                </div>
            </div>
            <div class="right-section">
                <div class="volume-control" @mouseenter="showVolumePopover" @mouseleave="hideVolumePopover">
                    <Button icon="pi pi-volume-up" text rounded />
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
                <Button icon="pi pi-list" text rounded @click="showPlaylist" />
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

const playerStore = usePlayerStore();
const { volume, isPlaying } = storeToRefs(playerStore);
const progress = computed({
    get: () => playerStore.progress,
    set: (value) => playerStore.seek(value)
});

const currentTrack = computed(() => playerStore.currentTrack);
const currentTime = computed(() => playerStore.currentTime);
const duration = computed(() => playerStore.duration);

const togglePlay = () => {
    if (isPlaying.value) {
        playerStore.pause();
    } else {
        playerStore.play();
    }
};

const previousTrack = () => {
    playerStore.previousTrack();
};

const nextTrack = () => {
    playerStore.nextTrack();
};

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const playlistDrawer = inject('playlistDrawer') as Ref<InstanceType<typeof PlaylistDrawer>>;

const showPlaylist = () => {
    if (playlistDrawer.value) {
        playlistDrawer.value.visible = true;
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

</script>

<style scoped>
.now-playing {
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    z-index: 999;
}

.progress-slider {
    margin: 0;
    padding: 0;
}

.content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.album-cover {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
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
}

.artist-and-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
}

.playback-time {
    font-size: 0.8rem;
}

.song-source {
    font-size: 0.8rem;
    color: #ff9800;
    background-color: #fff3e0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
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

.right-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: flex-end;
}

:deep(.p-button.p-button-text) {
    color: #6c757d;
}

:deep(.p-button.p-button-text:hover) {
    background-color: #e9ecef;
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
    background: #ff5722;
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
    /* outline: none; */
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
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.volume-popover label {
    font-size: 0.8rem;
    color: #6c757d;
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