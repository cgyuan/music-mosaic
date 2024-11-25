<template>
    <div class="music-sheet-detail">
        <div class="header">
            <img :src="musicSheetItem.coverImg || musicSheetItem.artwork || albumCover" :alt="musicSheetItem.title"
                class="cover-image">
            <div class="info">
                <h1>{{ musicSheetItem.title }}</h1>
                <p v-if="musicSheetItem.artist">作者: {{ musicSheetItem.artist }}</p>
                <p v-if="musicSheetItem.playCount">播放数: {{ formatPlayCount(musicSheetItem.playCount) }}</p>
                <p v-if="musicSheetItem.worksNum || musicSheetItem?.musicList">歌曲数: {{ musicSheetItem.worksNum ||
                    musicSheetItem?.musicList?.length }}</p>
                <p v-if="musicSheetItem.description">简介: {{ musicSheetItem.description }}</p>
            </div>
        </div>
        <div class="actions">
            <Button label="播放" icon="pi pi-play" class="p-button-rounded" @click="playAll" />
            <Button label="添加" icon="pi pi-plus" class="p-button-rounded p-button-outlined" @click="handleAddAll()" />
            <Button label="收藏" icon="pi pi-heart" class="p-button-rounded p-button-outlined"
                v-if="musicSheetType === MusicSheetType.Cloud" />
        </div>
        <DataTable v-if="!isLoading" :value="musicSheetItem.musicList" stripedRows class="music-table"
            @rowDblclick="onRowDoubleClick" @rowContextmenu="onRowRightClick">
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
                <template #body="slotProps">
                    <span class="source-tag">{{ platform || slotProps.data.platform }}</span>
                </template>
            </Column>
            <template #empty>
                <LoadingOrEmpty :loading="isLoading" />
            </template>
        </DataTable>
        <div v-else class="loading-container">
            <Loading />
        </div>
        <ContextMenu ref="cm" :model="contextMenuItems" />

        <Dialog :draggable="false" v-model:visible="showPlaylistDialog" header="添加到歌单" :style="{ width: '30vw' }" @hide="handleDialogHide">
            <div class="playlist-selection">
                <div class="new-playlist" @click="createNewPlaylist">
                    <i class="pi pi-plus"></i>
                    <span>新建歌单</span>
                </div>
                <div v-for="item in musicSheets" :key="item.id" class="playlist-item"
                    @click="addToMusicSheet(item.id)">
                    <img :src="item.artwork || albumCover" :alt="item.title">
                    <span>{{ item.title }}</span>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePlayerStore } from '../store/playerStore';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Loading from './Loading.vue';
import ContextMenu from 'primevue/contextmenu';
import Dialog from 'primevue/dialog';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { MusicSheetType } from '@/common/constant';
import MusicSheet from '@/music-sheet';

const props = defineProps<{
    platform?: string;
    musicSheetItem: IMusic.IMusicSheetItem;
    isLoading: boolean;
    musicSheetType: MusicSheetType;
}>();

const playerStore = usePlayerStore();
const musicSheets = MusicSheet.frontend.useAllSheets();

const addAll = ref(false);

const cm = ref();
const selectedTrack = ref<IMusic.IMusicItem | null>(null);

const showPlaylistDialog = ref(false);

const contextMenuItems = ref([
    {
        label: '下一首播放',
        icon: 'pi pi-play',
        command: () => {
            if (selectedTrack.value) {
                // playerStore.addNextTrack(selectedTrack.value);
            }
        }
    },
    {
        label: '添加到歌单',
        icon: 'pi pi-plus',
        command: () => {
            if (selectedTrack.value) {
                showPlaylistDialog.value = true;
            }
        }
    },
    {
        label: '下载',
        icon: 'pi pi-download',
        command: () => {
            if (selectedTrack.value) {
                // Implement download functionality
                console.log('Download:', selectedTrack.value);
            }
        }
    }
]);

const createNewPlaylist = () => {
    // Implement new playlist creation logic
    console.log('Create new playlist');
};

const addToMusicSheet = (sheetId: string) => {
    if (addAll.value) {
        MusicSheet.frontend.addMusicToSheet(JSON.parse(JSON.stringify(props.musicSheetItem.musicList || [])), sheetId);
    } else if (selectedTrack.value) {
        MusicSheet.frontend.addMusicToSheet(JSON.parse(JSON.stringify(selectedTrack.value)), sheetId);
    }
    showPlaylistDialog.value = false;
};

const onRowRightClick = (event: {
    originalEvent(originalEvent: any): unknown; data: IMusic.IMusicItem
}) => {
    selectedTrack.value = event.data;
    cm.value.show(event.originalEvent);
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
    playerStore.setPlaylist(props.musicSheetItem.musicList || []);

    // Set the current track and play
    await playerStore.setCurrentTrackAndPlay(event.data);
};

const playAll = async () => {
    if (props.musicSheetItem.musicList && props.musicSheetItem.musicList.length > 0) {
        playerStore.setPlaylist(props.musicSheetItem.musicList || []);
        await playerStore.setCurrentTrackAndPlay(props.musicSheetItem.musicList[0]);
    }
};

const handleAddAll = () => {
    console.log("handleAddAll", props.musicSheetItem.musicList);
    addAll.value = true;
    showPlaylistDialog.value = true;
};

const handleDialogHide = () => {
    addAll.value = false;
};

watch(showPlaylistDialog, (newValue) => {
    if (!newValue) {
        handleDialogHide();
    }
});
</script>

<style scoped>
.music-sheet-detail {
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
    font-size: 18px;
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

.playlist-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.new-playlist,
.playlist-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
}

.new-playlist:hover,
.playlist-item:hover {
    background-color: #f0f0f0;
}

.new-playlist i {
    font-size: 24px;
    margin-right: 10px;
}

.playlist-item img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 10px;
}
</style>
