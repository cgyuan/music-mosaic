<template>
    <DataView :value="musicSheets" :layout="'grid'" :rows="10">
        <template #grid="slotProps">
            <div class="music-sheet-grid">
                <div v-for="(item, index) in slotProps.items" :key="index" class="music-sheet-item"
                    @click="goToMusicListDetail(item)">
                    <div class="music-sheet-image">
                        <div class="image-container">
                            <img :src="item.artwork" :alt="item.title" />
                        </div>
                    </div>
                    <div class="music-sheet-info">
                        <div class="music-sheet-title">{{ item.title || 'Untitled' }}</div>
                        <div class="music-sheet-subtitle">{{ item.artist || item.description || 'No description' }}
                        </div>
                        <div class="music-sheet-plays" v-if="item.playCount !== undefined">
                            <i class="pi pi-play"></i> {{ formatPlayCount(item.playCount) }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #empty>
            <LoadingOrEmpty :loading="isLoading" />
        </template>
    </DataView>
</template>

<script setup lang="ts">
import { MusicSheetType } from '@/common/constant';
import DataView from 'primevue/dataview';
import router from '@/router';

const props = defineProps<{
    musicSheets: IMusic.IMusicSheetItem[],
    activePlugin: IPlugin.IPluginInstance,
    isLoading: boolean
}>()

const formatPlayCount = (count: number) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
};

const goToMusicListDetail = (item: IMusic.IMusicSheetItem) => {
    console.log('item', item);
    item.platform = props.activePlugin.platform;
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
}
</script>

<style scoped>
.music-sheet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
    gap: 1rem;
}

.music-sheet-item {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.music-sheet-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
}

.image-container {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
}

.image-container:hover {
    transform: scale(1.05);
}

.music-sheet-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
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
}

.music-sheet-subtitle {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-sheet-plays {
    font-size: 0.8rem;
    color: #999;
}

.music-sheet-plays i {
    margin-right: 0.25rem;
}
</style>