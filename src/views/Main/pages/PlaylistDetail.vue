<template>
    <CommonMusicSheet :musicSheetItem="musicSheetItem" :platform="currentPlugin?.platform" :isLoading="isLoading" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import CommonMusicSheet from '@/components/CommonMusicSheet.vue';
import { useMusicSheetStore } from '@/store/musicSheetStore';
import { storeToRefs } from 'pinia';

const musicSheetStore = useMusicSheetStore();
const { currentPlaylist } = storeToRefs(musicSheetStore);
const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());


const isLoading = ref(false);

const route = useRoute();

const playlistId = route.params.id as string;

const musicSheetItem = ref(currentPlaylist.value as IMusic.IMusicSheetItem);


onMounted(() => {
    getMusicListDetail();
});


const getMusicListDetail = async () => {
    currentPlaylist.value = musicSheetStore.getMusicSheetSummaryById(playlistId);
    musicSheetItem.value = currentPlaylist.value as IMusic.IMusicSheetItem;
    isLoading.value = true;
    musicSheetItem.value.musicList = (await musicSheetStore.fetchMusicSheet(playlistId))?.tracks;
    isLoading.value = false;
};

</script>
