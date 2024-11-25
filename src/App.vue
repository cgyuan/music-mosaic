<script setup lang="ts">
import MusicSheet from './music-sheet';
import { usePlayerStore } from '@/store/playerStore';
import { usePluginStore } from '@/store/pluginStore';
import { setupRecentlyPlaylist } from '@/hooks/useRecentPlayed';
import useThemes from '@/hooks/useThemes';

const { loadThemePacks } = useThemes();

const pluginStore = usePluginStore();
pluginStore.$persistedState.isReady().then(() => {
    pluginStore.loadPlugins();
});

const playerStore = usePlayerStore();
playerStore.$persistedState.isReady().then(() => {
    playerStore.init();
});

MusicSheet.frontend.setupMusicSheets();
setupRecentlyPlaylist();
loadThemePacks();
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
