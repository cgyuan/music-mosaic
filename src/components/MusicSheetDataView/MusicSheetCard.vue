<template>
    <div class="music-sheet-item" @click="goToMusicListDetail">
        <div class="music-sheet-image">
            <div class="image-container">
                <img :src="item.artwork || item.coverImg" :alt="item.title" />
            </div>
            <div class="play-count" v-if="item.playCount !== undefined">
                <i class="pi pi-headphones"></i> {{ formatPlayCount(item.playCount) }}
            </div>
        </div>
        <div class="music-sheet-info">
            <div class="music-sheet-title">{{ item.title || 'Untitled' }}</div>
            <div class="music-sheet-subtitle">{{ item.artist || item.description || 'No description' }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MusicSheetType } from '@/common/constant';
import router from '@/router';

const props = defineProps<{
    item: IMusic.IMusicSheetItem,
    activePlugin: IPlugin.IPluginInstance
}>();

const formatPlayCount = (count: number) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
};

const goToMusicListDetail = () => {
    const item = { ...props.item, platform: props.activePlugin.platform };
    router.push({
        name: 'music-sheet-detail',
        params: { 
            id: item.id,
            itemData: JSON.stringify(item) 
        },
        query: {
            type: MusicSheetType.Cloud
        }
    });
};
</script>

<style scoped>
.music-sheet-item {
    display: flex;
    flex-direction: column;
    /* background-color: ÷#fff; */
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
}

.music-sheet-image {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
}

.image-container {
    width: 100%;
    height: 100%;
}

.music-sheet-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.music-sheet-item:hover .music-sheet-image img {
    transform: scale(1.1);
}

.play-count {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
}

.play-count i {
    margin-right: 3px;
}

.music-sheet-info {
    padding: 0.5rem;
}

.music-sheet-title {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--textColor);
}

.music-sheet-subtitle {
    font-size: 0.7rem;
    color: var(--textColor);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
