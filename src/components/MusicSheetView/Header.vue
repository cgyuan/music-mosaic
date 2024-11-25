<template>
    <div class="music-sheet-header">
        <div class="header-info">
            <img :src="musicSheet.coverImg || musicSheet.artwork || albumCover" :alt="musicSheet.title"
                class="cover-image">
            <div class="info">
                <h1>{{ musicSheet.title }}</h1>
                <div v-if="musicSheet.artist">作者: {{ musicSheet.artist }}</div>
                <div v-if="musicSheet.playCount">播放数: {{ formatPlayCount(musicSheet.playCount) }}</div>
                <div>歌曲数: {{ musicSheet.worksNum || musicSheet?.musicList?.length || 0 }}</div>
                <div v-if="musicSheet.createAt">创建时间: {{ dayjs(musicSheet?.createAt).format("YYYY-MM-DD") }}</div>
                <div v-if="musicSheet.description">简介: {{ musicSheet.description }}</div>
            </div>
        </div>
        <div class="actions">
            <div data-type="primaryButton" role="button" @click="playAll" class="option-button">
                <SvgAsset iconName="play" />
                <span>播放</span>
            </div>
            <div data-type="normalButton" role="button" @click="handleAddAll()" class="option-button">
                <SvgAsset iconName="plus" />
                <span>添加</span>
            </div>
            <div data-type="normalButton" role="button" @click="handleStarMusicSheet" class="option-button">
                <SvgAsset :icon-name="isStarred ? 'heart' : 'heart-outline'" :color="isStarred ? 'red' : 'var(--textColor)'" />
                <span>收藏</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { MusicSheetType } from '@/common/constant';
import albumCover from '@/assets/imgs/album-cover.jpg';
import dayjs from 'dayjs';
import MusicSheet from '@/music-sheet';
import { isSameMedia } from '@/common/media-util';
import { computed } from 'vue';
import SvgAsset from '@/components/SvgAsset.vue';

const starredMusicSheets = MusicSheet.frontend.useAllStarredSheets();

const props = defineProps<{
    musicSheet: IMusic.IMusicSheetItem;
    musicSheetType: MusicSheetType;
    platform?: string;
}>();

let isStarred = computed(() => {
    return starredMusicSheets.value.find((item) =>
        isSameMedia(props.musicSheet, item)
    );
});

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

const handleStarMusicSheet = () => {
    if (isStarred.value) {
        MusicSheet.frontend.unstarMusicSheet(props.musicSheet);
    } else {
        const musicSheet = JSON.parse(JSON.stringify(props.musicSheet));
        musicSheet.platform = props.platform;
        delete musicSheet.musicList;
        MusicSheet.frontend.starMusicSheet(musicSheet);
    }
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
    color: var(--textColor);
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
    font-size: 12px;
    color: var(--textColor);
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

.option-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0.8em;
    padding-right: 0.8em;
}

.option-button svg {
    width: 1.3em;
    height: 1.3em;
    margin-right: 2px;
}
</style>
