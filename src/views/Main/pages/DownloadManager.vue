<template>
    <MusicList :musicList="downloadedMusicList" />
</template>

<script setup lang="ts">
import { useDownloadedMusicList } from '@/downloader/downloaded-sheet';
import MusicList from '@/components/MusicList.vue';

const downloadedMusicList = useDownloadedMusicList();
</script>

<style scoped>
:deep(.music-list) {
    padding: 20px 20px;
}
</style>