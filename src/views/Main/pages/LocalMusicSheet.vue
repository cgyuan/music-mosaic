<template>
    <MusicSheetView 
        :musicSheetItem="sheetItem!" 
        :platform="currentPlugin?.platform" 
        :state="pendingState"
        :musicSheetType="MusicSheetType.Local" 
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePluginStore } from '@/store/pluginStore.ts';
import MusicSheetView from '@/components/MusicSheetView/index.vue';
import { MusicSheetType } from '@/common/constant';
import MusicSheet from '@/music-sheet';

const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());

const route = useRoute();
const playlistId = computed(() => route.params.id as string);

const { sheetItem, pendingState } = MusicSheet.frontend.useMusicSheet(playlistId.value);

</script>
