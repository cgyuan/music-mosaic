<template>
    <CustomDataTable :loading="state === RequestStateCode.PENDING_FIRST_PAGE" :value="musicSheetItem.musicList || []"
        :columns="columns" keyField="id" :stripedRows="true" class="music-sheet-detail" :bufferSize="10"
        @row-dblclick="onRowDoubleClick" @row-contextmenu="onRowRightClick">
        <template #header>
            <Header :musicSheet="musicSheetItem" :musicSheetType="musicSheetType" @playAll="playAll"
                @addAll="handleAddAll" :platform="platform" />
        </template>
        <template #cell:actions="{ item }">
            <div class="item-actions">
                <MusicFavorite :musicItem="item" :size="20" />
                <MusicDownloaded :musicItem="item" :size="20" />
            </div>
        </template>
        <template #cell:index="{ index }">
            <div class="item-actions">
                {{ index + 1 }}
            </div>
        </template>
        <template #cell:duration="{ item }">
            {{ formatDuration(item.duration) }}
        </template>
        <template #cell:platform="{ item }">
            <span class="source-tag">{{ item.platform || platform }}</span>
        </template>

        <template #loading>
            <Loading />
        </template>
        <template #empty>
            <Empty />
        </template>
    </CustomDataTable>

    <ContextMenu ref="cm" :model="contextMenuItems" />

    <Dialog v-model:visible="showPlaylistDialog" header="添加到歌单" :style="{ width: '30vw' }" @hide="handleDialogHide">
        <div class="playlist-selection">
            <div class="new-playlist" @click="createNewPlaylist">
                <i class="pi pi-plus"></i>
                <span>新建歌单</span>
            </div>
            <div v-for="item in musicSheets" :key="item.id" class="playlist-item" @click="addToMusicSheet(item.id)">
                <img :src="item.artwork || albumCover" :alt="item.title">
                <span>{{ item.title }}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { usePlayerStore } from '../../store/playerStore';
import Loading from '@/components/Loading.vue';
import Empty from '@/components/Empty.vue';
import ContextMenu from 'primevue/contextmenu';
import Dialog from 'primevue/dialog';
import albumCover from '@/assets/imgs/album-cover.jpg';
import { MusicSheetType, RequestStateCode } from '@/common/constant';
import MusicSheet from '@/music-sheet';
import CustomDataTable from '@/components/CustomDataTable.vue';
import Header from './Header.vue';
const props = defineProps<{
    platform?: string;
    musicSheetItem: IMusic.IMusicSheetItem;
    state: RequestStateCode;
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

const columns = [
    { field: 'actions', header: '', width: '6rem' },
    { field: 'index', header: '#', width: '3rem' },
    { field: 'title', header: '标题' },
    { field: 'artist', header: '作者' },
    { field: 'album', header: '专辑' },
    { field: 'duration', header: '时长', width: '5rem' },
    { field: 'platform', header: '来源', width: '8rem' }
];

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

const onRowRightClick = (event: { item: IMusic.IMusicItem, event: MouseEvent }) => {
    selectedTrack.value = event.item;
    cm.value.show(event.event);
};


const formatDuration = (duration?: number) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const onRowDoubleClick = async (event: { item: IMusic.IMusicItem }) => {
    console.log('Double-clicked row data:', event.item);

    // Add the current music list to the playlist
    playerStore.setPlaylist([]);
    await nextTick();
    playerStore.setPlaylist(props.musicSheetItem.musicList || []);
    playerStore.setCurrentTrackAndPlay(event.item);

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

:deep(.custom-datatable) {
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
    gap: 1.5rem;
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