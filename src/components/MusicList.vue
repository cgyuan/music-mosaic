<template>
    <div class="music-list-wrapper">
        <CustomDataTable 
            ref="dataTableRef"
            :loading="isLoading" 
            :value="musicList || []"
            :columns="columns" 
            keyField="id" 
            :stripedRows="true" 
            class="music-list" 
            :bufferSize="10"
            :show-header="showHeader"
            @row-dblclick="onRowDoubleClick" @row-contextmenu="onRowRightClick">
            <template #header  v-if="$slots.header">
                <slot name="header"></slot>
            </template>
            <template #footer v-if="$slots.footer">
                <slot name="footer"></slot>
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
        <Dialog :draggable="false" v-model:visible="showMusicSheetDialog" header="添加到歌单" :style="{ width: '30vw' }" @hide="handleDialogHide">
            <div class="music-sheett-selection">
                <div class="new-music-sheet" @click="uiStore.showNewMusicSheetModal()">
                    <i class="pi pi-plus"></i>
                    <span>新建歌单</span>
                </div>
                <div v-for="item in musicSheets" :key="item.id" class="music-sheet-item" @click="addToMusicSheet(item.id)">
                    <img :src="item.artwork || albumCover" :alt="item.title">
                    <span>{{ item.title }}</span>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import Loading from '@/components/Loading.vue';
import Empty from '@/components/Empty.vue';
import ContextMenu from 'primevue/contextmenu';
import { DownloadState, RequestStateCode } from '@/common/constant';
import CustomDataTable from '@/components/CustomDataTable.vue';
import Dialog from 'primevue/dialog';
import albumCover from '@/assets/imgs/album-cover.jpg';
import MusicSheet from '@/music-sheet';
import { useUIStore } from '@/store/uiStore';
import Downloader from '@/downloader';
import { useRoute } from 'vue-router';
import { isDownloaded, removeDownloadedMusic } from '@/downloader/downloaded-sheet';
import { invoke } from '@tauri-apps/api/tauri';
import { getInternalData } from '@/common/media-util';

const route = useRoute();
const path = route.path;

const props = withDefaults(defineProps<{
    platform?: string;
    musicList: IMusic.IMusicItem[],
    state?: RequestStateCode;
    showHeader?: boolean,
}>(), {
    showHeader: true
});

const uiStore =  useUIStore();

const dataTableRef = ref<InstanceType<typeof CustomDataTable> | null>(null);

const isLoading = computed(() => {
    if (props.state) {
        return [RequestStateCode.PENDING_FIRST_PAGE].includes(props.state);
    }
    return false;
});
const playerStore = usePlayerStore();

const addAll = ref(false);

const cm = ref();

const musicSheets = MusicSheet.frontend.useAllSheets();

const selectedTrack = ref<IMusic.IMusicItem | null>(null);

const showMusicSheetDialog = ref(false);

const contextMenuItems = computed(() => [
    {
        label: '下一首播放',
        icon: 'pi pi-play',
        command: () => {
            if (selectedTrack.value) {
                playerStore.setPlayNext(selectedTrack.value);
            }
        }
    },
    {
        label: '添加到歌单',
        icon: 'pi pi-plus',
        command: () => {
            if (selectedTrack.value) {
                showMusicSheetDialog.value = true;
            }
        }
    },
    ...(path.startsWith('/my-music-sheet-detail') ? [{
        label: '从歌单内移除',
        icon: 'pi pi-trash',
        command: () => {
            console.log('delete');
            const sheetId = route.params.id as string;
            MusicSheet.frontend.removeMusicFromSheet(selectedTrack.value!, sheetId);
        }
    }] : []),
    ...(selectedTrack.value && !isDownloaded(selectedTrack.value) ? [{
        label: '下载',
        icon: 'pi pi-download',
        command: () => {
            Downloader.startDownload(selectedTrack.value!);
        }
    }] : [
        {
            label: '删除本地下载',
            icon: 'pi pi-trash',
            command: () => {
                removeDownloadedMusic(selectedTrack.value!, true);
            }
        },
        {
            label: '打开歌曲所在文件夹',
            icon: 'pi pi-folder',
            command: () => {
                const path = getInternalData(selectedTrack.value!, "downloadData")?.path;
                if (path) {
                    // get the folder path
                    const folderPath = path.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
                    console.log("folderPath", folderPath);
                    invoke("open_folder", { path: folderPath });
                }
            }
        }
    ])
]);

const columns = [
    { field: 'actions', header: '', width: '6rem' },
    { field: 'index', header: '#', width: '3.5rem' },
    { field: 'title', header: '标题' },
    { field: 'artist', header: '作者' },
    { field: 'album', header: '专辑' },
    { field: 'duration', header: '时长', width: '5rem' },
    { field: 'platform', header: '来源', width: '10rem' }
];

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
    // clone the music list to avoid direct mutation  
    const musicList = JSON.parse(JSON.stringify(props.musicList || []));
    playerStore.setPlaylist(musicList);
    playerStore.setCurrentTrackAndPlay(event.item);

};

const addToMusicSheet = (sheetId: string) => {
    if (addAll.value) {
        MusicSheet.frontend.addMusicToSheet(JSON.parse(JSON.stringify(props.musicList || [])), sheetId);
    } else if (selectedTrack.value) {
        MusicSheet.frontend.addMusicToSheet(JSON.parse(JSON.stringify(selectedTrack.value)), sheetId);
    }
    showMusicSheetDialog.value = false;
};

const createNewMusicSheet = () => {
    // Implement new music-sheett creation logic
    console.log('Create new music-sheett');
};


const handleDialogHide = () => {
    addAll.value = false;
};

const handleAddAll = () => {
    addAll.value = true;
    showMusicSheetDialog.value = true;
};

const playAll = async () => {
    if (props.musicList && props.musicList.length > 0) {
        playerStore.setPlaylist(props.musicList || []);
        await playerStore.setCurrentTrackAndPlay(props.musicList[0]);
    }
};

watch(showMusicSheetDialog, (newValue) => {
    if (!newValue) {
        handleDialogHide();
    }
});

const resetScroll = () => {
  if (dataTableRef.value) {
    dataTableRef.value.scrollToIndex(0);
  }
};

defineExpose({
    playAll,
    handleAddAll,
    resetScroll
})
</script>

<style scoped>
.music-list-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.music-list {
    flex: 1;
    overflow-y: auto;
}

:deep(.custom-datatable) {
    font-size: 14px;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.source-tag {
    background-color: var(--primaryColor);
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    color: white;
}

.music-sheett-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
}

.new-music-sheet,
.music-sheet-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--textColor);
}

.new-music-sheet:hover,
.music-sheet-item:hover {
    background-color: var(--listHoverColor);
}

.music-sheet-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.new-music-sheet i {
    font-size: 24px;
    margin-right: 10px;
}

.music-sheet-item img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 10px;
}
</style>