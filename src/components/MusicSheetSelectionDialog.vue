<template>
    <Dialog 
        :draggable="false" 
        :visible="modelValue" 
        header="添加到歌单" 
        :style="{ width: '30vw' }" 
        @update:visible="$emit('update:modelValue', $event)"
        @hide="handleDialogHide"
    >
        <div class="music-sheet-selection">
            <div class="new-music-sheet" @click="uiStore.showNewMusicSheetModal()">
                <i class="pi pi-plus"></i>
                <span>新建歌单</span>
            </div>
            <div 
                v-for="item in musicSheets" 
                :key="item.id" 
                class="music-sheet-item" 
                @click="handleSelect(item.id)"
            >
                <img :src="item.artwork || albumCover" :alt="item.title">
                <span>{{ item.title }}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import albumCover from '@/assets/imgs/album-cover.jpg';
import MusicSheet from '@/music-sheet';
import { useUIStore } from '@/store/uiStore';

const props = defineProps<{
    modelValue: boolean,
    musicList: IMusic.IMusicItem | IMusic.IMusicItem[]
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void,
    (e: 'complete'): void
}>();

const uiStore = useUIStore();
const musicSheets = MusicSheet.frontend.useAllSheets();

const handleSelect = (sheetId: string) => {
    MusicSheet.frontend.addMusicToSheet(JSON.parse(JSON.stringify(props.musicList)), sheetId);
    emit('update:modelValue', false);
    emit('complete');
};

const handleDialogHide = () => {
    emit('update:modelValue', false);
};
</script>

<style scoped>
.music-sheet-selection {
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