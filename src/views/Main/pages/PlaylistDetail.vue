<template>
    <CommonMusicSheet :musicSheetItem="musicSheetItem" :platform="currentPlugin?.platform" :isLoading="isLoading" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import CommonMusicSheet from '@/components/CommonMusicSheet.vue';
import { usePlaylistStore } from '@/store/playlistStore';
import { storeToRefs } from 'pinia';

const playlistStore = usePlaylistStore();
const { currentPlaylist } = storeToRefs(playlistStore);
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
    currentPlaylist.value = playlistStore.getPlaylistSummaryById(playlistId);
    musicSheetItem.value = currentPlaylist.value as IMusic.IMusicSheetItem;
    isLoading.value = true;
    musicSheetItem.value.musicList = (await playlistStore.fetchPlaylist(playlistId))?.tracks;
    isLoading.value = false;
};

</script>
