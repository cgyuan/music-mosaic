<template>
    <div class="now-playing">
        <Slider v-model="progress" class="progress-slider" />
        <div class="content">
            <div class="left-section">
                <img class="album-cover" src="https://picsum.photos/id/237/300/300" alt="Album Cover">
                <div class="song-details">
                    <div class="song-title">Dream It Possible</div>
                    <div class="artist-and-time">
                        <span class="artist">Delacey</span>
                        <span class="playback-time">01:30/03:24</span>
                    </div>
                </div>
                <div class="song-source">QQ音乐</div>
            </div>
            <div class="center-section">
                <div class="playback-controls">
                    <Button icon="pi pi-step-backward" text rounded />
                    <Button icon="pi pi-play" text rounded class="play-button" />
                    <Button icon="pi pi-step-forward" text rounded />
                </div>
            </div>
            <div class="right-section">
                <Button icon="pi pi-volume-up" text rounded />
                <Button icon="pi pi-file-edit" text rounded />
                <Button icon="pi pi-sync" text rounded />
                <Button icon="pi pi-list" text rounded />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Slider from 'primevue/slider';

const progress = ref(44);
</script>

<style scoped>
.now-playing {
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
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
    flex-direction: column;
}

.song-title {
    font-weight: bold;
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

:deep(.p-slider:hover),
:deep(.p-slider.dragging) {
    height: 4px;
}

:deep(.p-slider-range) {
    background: #ff5722;
}

:deep(.p-slider-handle) {
    display: none;
}

:deep(.p-slider:hover .p-slider-handle) {
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
</style>

<script lang="ts">
export default {
    mounted() {
        const slider = this.$el.querySelector('.p-slider');
        if (slider) {
            slider.addEventListener('mousedown', () => slider.classList.add('dragging'));
            document.addEventListener('mouseup', () => slider.classList.remove('dragging'));
        }
    }
}
</script>