<template>
    <DataView :value="albums" :layout="'grid'" :rows="10">
        <template #grid="slotProps">
            <div class="album-grid">
                <div v-for="(item, index) in slotProps.items" :key="index" class="album-item"
                    @click="goToMusicListDetail(item)">
                    <div class="album-image">
                        <div class="image-container">
                            <img :src="item.coverImg || item.artwork || albumCover" :alt="item.title" />
                        </div>
                    </div>
                    <div class="album-info">
                        <div class="album-title">{{ item.title || 'Untitled' }}</div>
                        <div class="album-description" v-if="item.description || item.artist">{{ item.description || item.artist }}
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
import DataView from 'primevue/dataview';
import albumCover from '@/assets/imgs/album-cover.jpg';
import router from '@/router';
import { MusicSheetType } from '@/common/constant';
const props = withDefaults(defineProps<{
    albums: IMusic.IMusicSheetItem[],
    activePlugin: IPlugin.IPluginInstance,
    mediaSheetType?: MusicSheetType,
    isLoading?: boolean
}>(), {
    mediaSheetTtype: MusicSheetType.Ranking,
    isLoading: false
});

const goToMusicListDetail = (item: IMusic.IMusicSheetItem) => {
    item.platform = props.activePlugin.platform;
    router.push({
        name: 'music-sheet-detail',
        params: {
            id: item.id,
            itemData: JSON.stringify(item)
        },
        query: {
            type: props.mediaSheetType
        }
    });
};
</script>

<style scoped>
:deep(.p-dataview-content) {
    background: transparent;
}

.album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
    gap: 1rem;
}

.album-item {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.album-image {
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

.album-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.album-info {
    padding: 0.5rem;
}

.album-title {
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--textColor);
}

.album-description {
    font-size: 0.7rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--textColor);
}
</style>