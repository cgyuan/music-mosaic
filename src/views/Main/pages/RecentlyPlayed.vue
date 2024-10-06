<template>
  <MusicSheetView 
      :musicSheetItem="sheetItem!" 
      :platform="currentPlugin?.platform" 
      :state="RequestStateCode.FINISHED"
      :musicSheetType="MusicSheetType.Local" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePluginStore } from '@/store/pluginStore.ts';
import MusicSheetView from '@/components/MusicSheetView/index.vue';
import { MusicSheetType, RequestStateCode } from '@/common/constant';
import { useRecentPlayedlist } from '@/hooks/useRecentPlayed'


const recentPlayedlist = useRecentPlayedlist()

const pluginStore = usePluginStore();
const currentPlugin = computed(() => pluginStore.getCurrentPlugin());

const sheetItem = computed(() => {
  return {
    id: "recent-play",
    title: '最近播放',
    artwork: recentPlayedlist.value?.[0]?.artwork,
    musicList: recentPlayedlist.value
  } as IMusic.IMusicSheetItem
});

</script>
