<template>
    <CustomDataTable :loading="state === RequestStateCode.PENDING_FIRST_PAGE" :value="musicList || []"
        :columns="columns" keyField="id" :stripedRows="true" class="music-sheet-detail" :bufferSize="10"
        :show-header="true"
        @row-dblclick="onRowDoubleClick" @row-contextmenu="onRowRightClick">
        <template #header>
            <slot name="header"></slot>
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
    <Dialog v-model:visible="showMusicSheetDialog" header="添加到歌单" :style="{ width: '30vw' }" @hide="handleDialogHide">
        <div class="music-sheett-selection">
            <div class="new-music-sheett">
                <i class="pi pi-plus"></i>
                <span>新建歌单</span>
            </div>
            <div v-for="item in musicSheets" :key="item.id" class="music-sheett-item" @click="addToMusicSheet(item.id)">
                <img :src="item.artwork || albumCover" :alt="item.title">
                <span>{{ item.title }}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import Loading from '@/components/Loading.vue';
import Empty from '@/components/Empty.vue';
import ContextMenu from 'primevue/contextmenu';
import { MusicSheetType, RequestStateCode } from '@/common/constant';
import CustomDataTable from '@/components/CustomDataTable.vue';
import Dialog from 'primevue/dialog';
import albumCover from '@/assets/imgs/album-cover.jpg';
import MusicSheet from '@/music-sheet';

const props = defineProps<{
    platform?: string;
    musicList: IMusic.IMusicItem[],
    state: RequestStateCode;
    musicSheetType: MusicSheetType;
}>();

const playerStore = usePlayerStore();

const addAll = ref(false);

const cm = ref();

const musicSheets = MusicSheet.frontend.useAllSheets();

const selectedTrack = ref<IMusic.IMusicItem | null>(null);

const showMusicSheetDialog = ref(false);

const contextMenuItems = ref([
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
    playerStore.setPlaylist(props.musicList || []);
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

defineExpose({
    playAll,
    handleAddAll
})
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

.music-sheett-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.new-music-sheett,
.music-sheett-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
}

.new-music-sheett:hover,
.music-sheett-item:hover {
    background-color: #f0f0f0;
}

.new-music-sheett i {
    font-size: 24px;
    margin-right: 10px;
}

.music-sheett-item img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 10px;
}
</style>