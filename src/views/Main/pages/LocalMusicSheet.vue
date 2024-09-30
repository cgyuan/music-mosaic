<template>
    <CommonMusicSheet 
        :musicSheetItem="sheetItem!" 
        :platform="currentPlugin?.platform" 
        :isLoading="false" 
        :musicSheetType="MusicSheetType.Local" 
    />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import CommonMusicSheet from '@/components/CommonMusicSheet.vue';
import { MusicSheetType } from '@/common/constant';
import MusicSheet from '@/music-sheet';

const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());

const isLoading = ref(true);
const route = useRoute();
const playlistId = computed(() => route.params.id as string);

const { sheetItem, pendingState } = MusicSheet.frontend.useMusicSheet(playlistId.value);

</script>
