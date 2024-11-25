<template>
  <div class="app-container">
    <AppHeader />
    <Toast :style="{
      top: '60px',
    }" />
    <div class="body-container">
      <AppSideBar />
      <MainContent class="">
        <router-view :key="$route.fullPath"></router-view>
      </MainContent>
      <LyricView :platform="currentTrack?.platform" :showTranslation="true" />
    </div>
    <NowPlaying />
    <PlaylistDrawer ref="playlistDrawer" />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';
import LyricView from '@/components/LyricView.vue';
import { usePlayerStore } from '@/store/playerStore';
import { storeToRefs } from 'pinia';
import Toast from 'primevue/toast';


const playerStore = usePlayerStore();
const { currentTrack } = storeToRefs(playerStore);

const playlistDrawer = ref(null);

// Provide the playlistDrawer to be accessible by child components
provide('playlistDrawer', playlistDrawer);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.body-container {
  width: 100%;
  height: calc(100vh - 54px - 64px);
  flex: auto;
  display: flex;
  position: relative;
}
</style>
