<template>
    <CommonMusicSheet :musicSheetItem="musicSheetItem" :platform="currentPlugin?.platform" :isLoading="isLoading" :musicSheetType="MusicSheetType.Local" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import CommonMusicSheet from '@/components/CommonMusicSheet.vue';
import { useMusicSheetStore } from '@/store/musicSheetStore';
import { storeToRefs } from 'pinia';
import { MusicSheetType } from '@/common/constant';

const musicSheetStore = useMusicSheetStore();
const { currentMusicSheet } = storeToRefs(musicSheetStore);
const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());


const isLoading = ref(false);

const route = useRoute();

const playlistId = route.params.id as string;

const musicSheetItem = ref(currentMusicSheet.value as IMusic.IMusicSheetItem);


onMounted(() => {
    nextTick(() => {
        getMusicListDetail();
    });
});


const getMusicListDetail = () => {
    currentMusicSheet.value = musicSheetStore.getMusicSheetSummaryById(playlistId);
    musicSheetItem.value = currentMusicSheet.value as IMusic.IMusicSheetItem;
    isLoading.value = true;
    musicSheetStore.fetchMusicSheet(playlistId).then(res => {
        musicSheetItem.value.musicList = res?.tracks;
        isLoading.value = false;
    }).finally(() => {
        isLoading.value = false;
    });
};

</script>
