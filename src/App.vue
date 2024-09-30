<script setup lang="ts">
import MusicSheet from './music-sheet';
import { usePluginStore } from './store/pluginStore';

const pluginStore = usePluginStore();
pluginStore.$persistedState.isReady().then(() => {
    pluginStore.loadPlugins();
});

MusicSheet.frontend.setupMusicSheets();
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>

</style>
