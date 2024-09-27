<template>
    <div class="music-list-detail">
        <div class="header">
            <img :src="musicSheetItem.coverImg || musicSheetItem.artwork" :alt="musicSheetItem.title"
                class="cover-image">
            <div class="info">
                <h1>{{ musicSheetItem.title }}</h1>
                <p>作者: {{ musicSheetItem.artist || '未知' }}</p>
                <p>播放数: {{ formatPlayCount(musicSheetItem.playCount) }}</p>
                <p>歌曲数: {{ musicSheetItem.worksNum || musicList.length }}</p>
            </div>
        </div>
        <div class="actions">
            <Button label="播放" icon="pi pi-play" class="p-button-rounded" />
            <Button label="添加" icon="pi pi-plus" class="p-button-rounded p-button-outlined" />
            <Button label="收藏" icon="pi pi-heart" class="p-button-rounded p-button-outlined" />
        </div>
        <DataTable v-if="!isLoading" :value="musicList" stripedRows class="music-table" @rowDblclick="onRowDoubleClick">
            <Column style="width: 8rem; flex: 0 0 8rem;">
                <template #body="slotProps">
                    <div class="item-actions">
                        <Button icon="pi pi-heart" class="p-button-rounded p-button-text p-button-sm" />
                        <Button icon="pi pi-download" class="p-button-rounded p-button-text p-button-sm" />
                        {{ slotProps.index + 1 }}
                    </div>
                </template>
            </Column>
            <Column field="title" header="标题" style="flex: 1 1 auto; min-width: 0;" />
            <Column field="artist" header="作者" style="flex: 0 0 20%;" />
            <Column field="album" header="专辑" style="flex: 0 0 20%;" />
            <Column header="时长" style="width: 6rem; flex: 0 0 6rem;">
                <template #body="slotProps">
                    {{ formatDuration(slotProps.data.duration) }}
                </template>
            </Column>
            <Column header="来源" style="width: 6rem; flex: 0 0 6rem;">
                <template #body>
                    <span class="source-tag">{{ currentPlugin?.platform }}</span>
                </template>
            </Column>
            <template #empty>
                <LoadingOrEmpty :loading="isLoading" />
            </template>
        </DataTable>
        <div v-else class="loading-container">
            <Loading />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '../../../store/pluginStore';
import { usePlayerStore } from '../../../store/playerStore'; // Add this import
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Loading from '../../../components/Loading.vue';

const pluginStore = usePluginStore();
const playerStore = usePlayerStore(); // Add this line
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());

const isLoading = ref(false);

const route = useRoute();

const musicList = ref<IMusic.IMusicItem[]>([]);

let itemString = route.params.item as string;
if (itemString) {
    localStorage.setItem('music-list-item', itemString);
} else {
    itemString = localStorage.getItem('music-list-item') || '';
}
const musicSheetItem = JSON.parse(itemString) as IMusic.IMusicSheetItem;

onMounted(() => {
    if (itemString) {
        getMusicListDetail(1);
    }
});

watch(() => currentPlugin.value, () => {
    if (musicSheetItem) {
        getMusicListDetail(1);
    }
});

const getMusicListDetail = async (page: number) => {
    if (currentPlugin.value && currentPlugin.value.getTopListDetail) {
        try {
            isLoading.value = true;
            console.log(musicSheetItem)
            const res = await currentPlugin.value.getTopListDetail(musicSheetItem, page);
            if (res.musicList) {
                musicList.value = res.musicList.map(item => {
                    item.platform = currentPlugin.value?.platform || '';
                    return item;
                });
            }
            console.log(res);
        } catch (error) {
            console.error('Error fetching music list detail:', error);
        } finally {
            isLoading.value = false;
        }
    }
};

const formatPlayCount = (count?: number) => {
    if (!count) return '0';
    return count >= 10000 ? `${(count / 10000).toFixed(1)}万` : count.toString();
};

const formatDuration = (duration?: number) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const onRowDoubleClick = async (event: { data: IMusic.IMusicItem }) => {
    console.log('Double-clicked row data:', event.data);
    
    // Add the current music list to the playlist
    musicList.value.map(item => {
        item.platform = currentPlugin.value?.platform || '';
    });
    playerStore.setPlaylist(musicList.value);
    
    // Set the current track and play
    await playerStore.setCurrentTrackAndPlay(event.data);
};

</script>

<style scoped>
.music-list-detail {
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    box-sizing: border-box;
}

.header {
    display: flex;
    margin-bottom: 20px;
}

.cover-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 20px;
}

.info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.info h1 {
    margin-bottom: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info p {
    margin: 5px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.music-table {
    font-size: 14px;
}

:deep(.p-datatable-wrapper) {
    overflow-x: hidden !important;
}

:deep(.p-datatable-table) {
    /*  ensure the table fits the container width */
    width: 100%;
    table-layout: fixed;
}

:deep(.p-datatable-thead > tr > th),
:deep(.p-datatable-tbody > tr > td) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 5px;
}

.item-actions .p-button-sm {
    padding: 0.25rem;
}

.source-tag {
    background-color: #f0f0f0;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
}
</style>
