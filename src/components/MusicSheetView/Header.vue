<template>
    <div class="music-sheet-header">
        <div class="header-info">
            <img :src="musicSheetItem.coverImg || musicSheetItem.artwork || albumCover" :alt="musicSheetItem.title"
                class="cover-image">
            <div class="info">
                <h1>{{ musicSheetItem.title }}</h1>
                <div v-if="musicSheetItem.artist">作者: {{ musicSheetItem.artist }}</div>
                <div v-if="musicSheetItem.playCount">播放数: {{ formatPlayCount(musicSheetItem.playCount) }}</div>
                <div>歌曲数: {{ musicSheetItem.worksNum || musicSheetItem?.musicList?.length || 0 }}</div>
                <div v-if="musicSheetItem.createAt">创建时间: {{ dayjs(musicSheetItem?.createAt).format("YYYY-MM-DD") }}</div>
                <div v-if="musicSheetItem.description">简介: {{ musicSheetItem.description }}</div>
            </div>
        </div>
        <div class="actions">
            <Button label="播放" icon="pi pi-play" class="p-button-rounded" @click="playAll" />
            <Button label="添加" icon="pi pi-plus" class="p-button-rounded p-button-outlined" @click="handleAddAll()" />
            <Button label="收藏" icon="pi pi-heart" class="p-button-rounded p-button-outlined"
                v-if="musicSheetType === MusicSheetType.Cloud" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { MusicSheetType } from '@/common/constant';
import albumCover from '@/assets/imgs/album-cover.jpg';
import dayjs from 'dayjs';

defineProps<{
    musicSheetItem: IMusic.IMusicSheetItem;
    musicSheetType: MusicSheetType;
}>();

const emit = defineEmits(['playAll', 'addAll']);

const formatPlayCount = (count?: number) => {
    if (!count) return '0';
    return count >= 10000 ? `${(count / 10000).toFixed(1)}万` : count.toString();
};

const playAll = () => {
    emit('playAll');
};

const handleAddAll = () => {
    emit('addAll');
};
</script>

<style scoped>
.music-sheet-header {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.header-info {
    display: flex;
    width: 100%;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.info h1 {
    margin-bottom: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
}

.info div {
    margin: 5px 0;
    font-size: 14px;
    color: #5C5C5C;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5em;
    max-height: 3em;
}

.actions {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}
</style>